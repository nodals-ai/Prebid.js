import { expect } from 'chai';
import {
  spec,
} from 'modules/nodalsBidAdapter.js';
import * as utils from 'src/utils.js';
import * as ajax from 'src/ajax.js';

describe('Nodals bidding adapter', function () {
  let utilsMock, sandbox, ajaxStub;

  beforeEach(function () {
    utilsMock = sinon.mock(utils);
    sandbox = sinon.sandbox.create();
    ajaxStub = sandbox.stub(ajax, 'ajax');
  });

  afterEach(function () {
    $$PREBID_GLOBAL$$.bidderSettings = {};
    utilsMock.restore();
    sandbox.restore();
    ajaxStub.restore();
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

    it('should return true when given a publisherId bid', function () {
      const bid = {
        bidder: 'nodals',
        params: {
          publisherId: 123456,
        },
      };
      const isValid = spec.isBidRequestValid(bid);
      expect(isValid).to.equal(true);
    });
  });
});
