const request = require('request')

exports = module.exports = {}

exports.register = (option, cb) => {
	let url = [
		option.url,
		'/api/external.php?action=requestApiKey&email=',
		option.email,
		'&siteName=',
		option.siteName,
		'&siteUrl=',
		option.siteUrl,
		'&public=',
		option.isPublic
	].join('')

	request({
		url: url,
		json: true
	}, (error, response, body) => {
		cb(error, response, body)
	})
}

exports.updateSiteData = (option, cb) => {
	let url = [
		option.url,
		'/api/external.php?action=updateSiteData&privateApiKey=',
		option.privateApiKey,
		'&email=',
		option.email,
		'&siteName=',
		option.siteName,
		'&siteUrl=',
		option.siteUrl,
		'&public=',
		option.isPublic
	].join('')

	request({
		url: url,
		json: true
	}, (error, response, body) => {
		cb(error, response, body)
	})
}

exports.getMapData = (option, cb) => {
	let url = [
		option.url,
		'/api/external.php?action=getMapData&privateApiKey=',
		option.privateApiKey,
		(option.date ? ['&date=', option.date].join('') : '')
	].join('')
	console.log(url)
	request({
		url: url,
		json: true
	}, (error, response, body) => {
		cb(error, response, body)
	})
}