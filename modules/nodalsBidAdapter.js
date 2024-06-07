import { deepSetValue } from '../src/utils.js';
import { ortbConverter } from '../libraries/ortbConverter/converter.js';
import { registerBidder } from '../src/adapters/bidderFactory.js';
import { config } from '../src/config.js';
import { BANNER } from '../src/mediaTypes.js';
import { getStorageManager } from '../src/storageManager.js';

/**
 * @typedef {import('../src/adapters/bidderFactory.js').BidRequest} BidRequest
 * @typedef {import('../src/adapters/bidderFactory.js').Bid} Bid
 * @typedef {import('../src/adapters/bidderFactory.js').ServerRequest} ServerRequest
 * @typedef {import('../src/adapters/bidderFactory.js').BidderSpec} BidderSpec
 */

const BIDDER_CODE = 'nodals';
const BIDDER_ENDPOINT = 'http://localhost:80/ortb2_5/pb_request';
export const ADAPTER_VERSION = 1;
export const storage = getStorageManager({ bidderCode: BIDDER_CODE });

const converter = ortbConverter({
  context: {
    // `netRevenue` and `ttl` are required properties of bid responses - provide a default for them
    netRevenue: true, // or false if your adapter should set bidResponse.netRevenue = false
    ttl: 30 // default bidResponse.ttl (when not specified in ORTB response.seatbid[].bid[].exp)
  },
  imp(buildImp, bidRequest, context) {
    const imp = buildImp(bidRequest, context);
    deepSetValue(imp, 'ext', bidRequest.params);
    deepSetValue(imp, 'tagid', bidRequest.adUnitCode ?? null);
    return imp;
  },
  request(buildRequest, imps, bidderRequest, context) {
    const request = buildRequest(imps, bidderRequest, context);
    deepSetValue(request, 'ext.adapterVersion', ADAPTER_VERSION);
    deepSetValue(request, 'ext.prebidVersion', encodeURIComponent('$prebid.version$'));
    deepSetValue(request, 'ext.lsEnabled', storage.localStorageIsEnabled());
    return request;
  },
  bidResponse(buildBidResponse, bid, context) {
    const bidResponse = buildBidResponse(bid, context);
    bidResponse.meta.networkName = BIDDER_CODE;
    return bidResponse;
  },
});

/** @type {BidderSpec} */
export const spec = {
  code: BIDDER_CODE,
  gvlid: 0,
  supportedMediaTypes: [BANNER],

  getUserSyncs: function (syncOptions, _, gdprConsent, uspConsent, gppConsent = {}) {
    return [];
  },

  /**
   * @param {object} bid
   * @return {boolean}
   */
  isBidRequestValid: (bid) => {
    // adUnitId must be set
    if (!(bid && bid.params && bid.params.adUnitId)) {
      return false;
    }

    return true;
  },

  /**
   * @param {BidRequest[]} bidRequests
   * @param {*} bidderRequest
   * @return {ServerRequest}
   */
  buildRequests: (bidRequests, bidderRequest) => {
    let fpd = bidderRequest.ortb2 || {};

    Object.assign(bidderRequest, {
      publisherExt: fpd.site?.ext,
      userExt: fpd.user?.ext,
      ceh: config.getConfig('ceh'),
      coppa: config.getConfig('coppa')
    });

    const url = BIDDER_ENDPOINT;
    const data = converter.toORTB({bidRequests, bidderRequest})

    if (data) {
      return {
        method: 'POST',
        url,
        data
      };
    }
  },

  /**
   * @param {*} response
   * @param {ServerRequest} request
   * @return {Bid[]}
   */
  interpretResponse: (response, request) => {
    const bids = converter.fromORTB({response: response.body, request: request.data}).bids;
    // likewise, you may need to adjust the bid response objects
    return bids;
  },
};

registerBidder(spec);
