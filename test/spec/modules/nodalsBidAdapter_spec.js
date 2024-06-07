import { expect } from 'chai';
import {
  spec,
} from 'modules/nodalsBidAdapter.js';
import * as utils from 'src/utils.js';
import * as ajax from 'src/ajax.js';

describe('Nodals bidding adapter', function () {
  afterEach(function () {
    $$PREBID_GLOBAL$$.bidderSettings = {};
  });

  describe('getUserSyncs', function () {
    it('should not trigger sync', function () {
      const userSyncs = spec.getUserSyncs({
        iframeEnabled: false
      }, undefined, undefined, undefined);

      expect(userSyncs).to.eql([]);
    });
  });

  describe('isBidRequestValid', function () {
    it('should return false when given an invalid bid', function () {
      const bid = {
        bidder: 'nodals',
      };
      const isValid = spec.isBidRequestValid(bid);
      expect(isValid).to.equal(false);
    });

    it('should return true given a adUnitId', function () {
      const bid = {
        bidder: 'nodals',
        params: {
          adUnitId: 123456,
        },
      };
      const isValid = spec.isBidRequestValid(bid);
      expect(isValid).to.equal(true);
    });
  });
});
