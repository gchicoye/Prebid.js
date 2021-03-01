# Overview
```
Module Name: Edisound Bid Adapter
Module Type: Bidder Adapter
Maintainer: contact@edisound.com
```

# Description
Module that connects to Edisound's server for bids.
Currently module supports only banner mediaType.

# Test Parameters
```
    var adUnits = [{
        code: '/test/div',
        mediaTypes: {
            banner: {
                sizes: [[300, 250]]
            }
        },
        bids: [{
            bidder: 'edisound',
            params: {
                placementId: 23123213
            }
        }]
    }];
```