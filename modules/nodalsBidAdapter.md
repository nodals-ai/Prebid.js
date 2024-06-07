# Overview

Module Name: Nodals Bidder Adapter
Module Type: Bidder Adapter
Maintainer: prebid@nodals.ai

# Description

Module that connects to Nodals' demand sources.

# Test Parameters
```
    var adUnits = [
        {
            code: 'banner-ad-div',
            sizes: [[300, 250], [728, 90]],
            bids: [
                {
                    bidder: 'nodals',
                    params: {
                        adUnitId: 123456
                    }
                }
            ]
        }
    ];
```
