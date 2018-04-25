# Travian Kingdoms API [![npm version](https://badge.fury.io/js/travian-kingdoms-api.svg)](https://badge.fury.io/js/travian-kingdoms-api)
JS Api for communication with travian kingdoms public (!!) endpoints.

### What is public endpoint?

Endpoints for external tools published by travian kingdoms.

## Functions
### register
You need to call this first, to get an privateApiKey / publicSiteKey. With this privateApiKey you can make further calls to our api's.

#### Options
| Name | Type | Required | Meaning |
| ------ | ------ | ------ | ------ |
| url | String | yes | Server url like https://cz4.travian.com |
| email  | String (max 255) | yes | Needs to be a valid email |
| siteName |String (max 255) | yes | Name of the tool  |
| siteUrl | String (max 255) | yes | Url of the tool - needs to be a valid url |
| public  | bool  |  yes |If you set it to true, that means we maybe include your tool in a tool list |

#### Example
```js
const tka = require('travian-kingdoms-api')

tka.register(
	{
		url: 'https://cz4.kingdoms.com',
		email: 'some@email.com',
		siteName: 'someSiteName',
		siteUrl: 'http://www.someSite.url',
		isPublic: 'true'
	},
	(err, response, body) => {
		/* handle err/response status if you want */
		console.log(body)
	}
)
```

#### Response
```json
{
    time: 1524656411039,
    response: {
        privateApiKey: 'xxx',
        publicSiteKey: 'yyy'
    }
}
```
### updateSiteData
You can call this if you want to update some data of your tool.

### Options
| Name | Type | Required | Meaning |
| ------ | ------ | ------ | ------ |
| url | String | yes | Server url like https://cz4.travian.com |
| privateApiKey | String | yes | Your private Api Key ( you retrieved via register function)|
| email  | String (max 255) | yes | Needs to be a valid email |
| siteName |String (max 255) | yes | Name of the tool  |
| siteUrl | String (max 255) | yes | Url of the tool - needs to be a valid url |
| public  | bool  |  yes |If you set it to true, that means we maybe include your tool in a tool list |
### Example
```js
const tka = require('travian-kingdoms-api')

tka.updateSiteData(
	{
		privateApiKey: 'xxx',
		url: 'https://cz4.kingdoms.com',
		email: 'some@email.com',
		siteName: 'someSiteName',
		siteUrl: 'http://www.someSite.url',
		isPublic: 'true'
	},
	(err, response, body) => {
		/* handle err/response status if you want */
		console.log(body)
	}
)
```
### Response
```json
{
    time: 1524656860998,
    response: {
        data: true
    }
}
```


### getMapData
To get all public map data (old map.sql :-) ) from a specific date).
### Options
| Name | Type | Required | Meaning |
| ------ | ------ | ------ | ------ |
| url | String | yes | Server url like https://cz4.travian.com |
| privateApiKey | String  | yes | Your private Api Key ( you retrieved via register function)|
| date | String  | no | Needs to be a date in format: d.m.Y (e.g. 27.08.2014). If no date is present, the today will be used. |

### Example
```js
const tka = require('travian-kingdoms-api')

tka.getMapData(
	{
		privateApiKey: 'xxx',
		url: 'https://cz4.kingdoms.com',
		date: '20.02.2018'
	},
	(err, response, body) => {
		/* handle err/response status if you want */
		console.log(body)
	}
)
```
Or without date:
```js
const tka = require('travian-kingdoms-api')

tka.getMapData(
	{
		privateApiKey: 'xxx',
		url: 'https://cz4.kingdoms.com'
	},
	(err, response, body) => {
		/* handle err/response status if you want */
		console.log(body)
	}
)
```
### Response
```js
{
    time: 1524659209779,
    response: {
        gameworld: {
            name: 'cz4',
            startTime: 1518008400,
            speed: 1,
            speedTroops: 1,
            lastUpdateTime: '1519167901',
            date: 1519084800,
            version: '1.0' },
         players: [ ... ], //array of players
         kingdoms:[ ... ], //array of kingdoms
         map: {
            radius: '60',
            cells: [ ... ], //array of cells
            landscapes: [ ... ] //array of landscapes
        }
    }
}
```
