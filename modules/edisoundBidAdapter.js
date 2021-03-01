import { getAdUnitSizes } from '../src/utils.js'
import {ajax} from '../src/ajax.js';
// import {config} from '../src/config.js';
import {registerBidder} from '../src/adapters/bidderFactory.js';
import {BANNER} from '../src/mediaTypes.js';

const BIDDER_CODE = 'edisound';
const BIDDER_URL = '//dev.eds-endpoint.cleoma.fr/'
const BIDDER_ENDPOINT_AUCTION = 'auction';
const BIDDER_ENDPOINT_BIDWON = 'bidwon'

export const spec = {
  code: BIDDER_CODE,

  supportedMediaTypes: [BANNER],
  /**
         * Determines whether or not the given bid request is valid.
         *
         * @param {BidRequest} bid The bid params to validate.
         * @return boolean True if this is a valid bid, and false otherwise.
         */
  isBidRequestValid: function(bid) {
    return !!(bid.params.placementId);
  },
  /**
         * Make a server request from the list of BidRequests.
         *
         * @param {validBidRequests[]} - an array of bids
         * @return ServerRequest Info describing the request to the server.
         */
  buildRequests: function(validBidRequests, bidderRequest) {
    const codes = validBidRequests.map((bidRequest) => {
      return {
        placementId: bidRequest.params.placementId,
        adunit: bidRequest.adUnitCode,
        bidId: bidRequest.bidId,
        auctionId: bidRequest.auctionId,
        transactionId: bidRequest.transactionId,
        sizes: getAdUnitSizes(bidRequest)
      }
    })

    const payload = {
      codes: codes,
      referer: encodeURIComponent(bidderRequest.refererInfo.referer)
    };
    if (bidderRequest && bidderRequest.gdprConsent) {
      payload.gdprConsent = {
        consentString: bidderRequest.gdprConsent.consentString,
        consentRequired: bidderRequest.gdprConsent.gdprApplies
      };
    }
    const payloadString = JSON.stringify(payload);
    return {
      method: 'POST',
      url: BIDDER_URL + BIDDER_ENDPOINT_AUCTION,
      data: payloadString,
    };
  },
  /**
         * Unpack the response from the server into a list of bids.
         *
         * @param {ServerResponse} serverResponse A successful response from the server.
         * @return {Bid[]} An array of bids which were nested inside the server.
         */
  interpretResponse: function(serverResponse, bidRequest) {
    const serverBody = serverResponse.body;
    if (serverBody.responses !== undefined) {
      return serverBody.responses
    }
    return []
  },

  /**
     * Register the user sync pixels which should be dropped after the auction.
     *
     * @param {SyncOptions} syncOptions Which user syncs are allowed?
     * @param {ServerResponse[]} serverResponses List of server's responses.
     * @return {UserSync[]} The user syncs which should be dropped.
     */
  getUserSyncs: function() {
  },

  /**
     * Register bidder specific code, which will execute if a bid from this bidder won the auction
     * @param {Bid} The bid that won the auction
     */
  onBidWon: function(data) {
    const output = {
      adUnitCode: data.adUnitCode,
      auctionId: data.auctionId
    }
    ajax(BIDDER_URL + BIDDER_ENDPOINT_BIDWON, null, JSON.stringify(output), {method: 'POST'});
    return true
    /*
    data.winNotification.forEach(function(unitWon) {
      let adPartnerBidWonUrl = utils.buildUrl({
        protocol: ENDPOINT_PROTOCOL,
        hostname: ENDPOINT_DOMAIN,
        pathname: unitWon.path
      });
      if (unitWon.method === 'POST') {
        spec.postRequest(adPartnerBidWonUrl, JSON.stringify(unitWon.data));
      }
    });
    */
  },
}
registerBidder(spec);
