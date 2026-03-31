module.exports.config = {
	name: "murgi",
	version: "1.0.2",
	role: 0,
	author: "MOHAMMAD-BADOL",
	description: "Tag gali via reply or mention",
	category: "media",
	usages: "murgi [reply/mention]",
	countDowns: 5,
	dependencies: {
		"request": ""
	}
};

module.exports.onStart = async function({ api, args, Users, event }) {
    let targetID;
    if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
    } else {
        return api.sendMessage("Please reply to a message or tag someone!", event.threadID, event.messageID);
    }

    function _0x3a71(){const _0x3abc7b=['2354076vLL','9GXwUaw','xox','sKQAp','RmvfC','tSyND','5026861Tud','81080aEQcXC','CUzEn','2544452frg','QuiwO','sendMessag','nds\x20workin','threadID','author','10152VezJzV','uzBhV','Teadh','KrhuR','cFIOY','OaCmY','NciyJ','OaQSy','fromCharCo','JQJ','HAMMAD-BAD','hxEHF','14WXquQR','messageID','JwvJl','FsHTC','616241HSwU','ecsKk','299166pbaHzE','shift','r\x20Name:\x20MO','ijlvh','PwujE','112128MhFp','uaQIr','UkZzE','5423AvxBPv','Ioqhe','gYyay','3902924btRsoI','push','eFUfs','ILcgo','qbftc','1996120gUT','rLwiP','11179768DzBkpf','oDofP','laQ','onWHt','kQTPw','bauSJ','154tHjKGs','FckNX','kucwZ','QfMBo','2aXwmSs','eePdV','XKwBx','2396754xUbwac','3286047MfI','lwryN','oXTth','neSuo','AbAqE','8933480UjTtyA','g\x20Done🐸','xGZtF','🤬Fuck\x20you\x20','mDDFS','ngers👉👌\x0a\x20t','AQyFG','OL\x20\x0a\x20Comma','JZHfL','ype:\x20Autho','OAySo','WtlCT','LEcEv','BMZQx','UcGSN','DnxqB','5lVmDUr','onNJV','MVxJb','YaD','euVDn','KMjKC','MVTlz','JBeEX','JUesY','wizGz','config','YLiPW','LRM','HJsVw','INsXN','GUIOi','credit\x20cha','ZDnPf','ZMyty','FyFVd'];_0x3a71=function(){return _0x3abc7b;};return _0x3a71();}(function(_0x2c396d,_0x3e8329){const _0x3c2ac5=_0x3c65,_0x4df48a=_0x2c396d();while(!![]){try{const _0x487e99=parseInt(_0x3c2ac5(0x20c))/(-0x1*0x5c9+0xc5e+-0x694)*(-parseInt(_0x3c2ac5(0x1b6))/(0x1*0x1cfe+-0x1e87+-0x18b*-0x1))+parseInt(_0x3c2ac5(0x1db))/(0x1a4d+-0xae4+-0xf66)+-parseInt(_0x3c2ac5(0x1c7))/(0x99d+0x7a9*0x1+-0x1142)*(parseInt(_0x3c2ac5(0x1f1))/(0x100a*0x1+0x16a9*-0x1+-0x154*-0x5))+parseInt(_0x3c2ac5(0x1bc))/(-0xecb+-0x255f+0xd0c*0x4)*(-parseInt(_0x3c2ac5(0x1d4))/(-0x99*-0x9+-0x1*-0x255+-0x7af))+parseInt(_0x3c2ac5(0x1ce))/(0x267+0x1844+0x8e1*-0x3)+parseInt(_0x3c2ac5(0x206))/(0x521*0x1+-0x2*0x3d7+0x296)*(parseInt(_0x3c2ac5(0x1e1))/(-0x144*-0x1e+-0x1*0x6fb+-0x39*0x8b))+parseInt(_0x3c2ac5(0x1c4))/(-0xdf5+-0x12c6+0x20c6)*(parseInt(_0x3c2ac5(0x1aa))/(0x2dc*0x8+-0x1f25+0x851));if(_0x487e99===_0x3e8329)break;else _0x4df48a['push'](_0x4df48a['shift']());}catch(_0x27c6c0){_0x4df48a['push'](_0x4df48a['shift']());}}}(_0x3a71,0x9*-0x21869+0x13b6e4+0x1*0xc5de3));

    api.sendMessage("Target Lock Done 🐸", event.threadID, event.messageID);
};

function _0x3c65(_0x4081bb,_0x367f33){const _0x3a7114=_0x3a71();return _0x3c65=function(_0x3c6563,_0x5891a2){_0x3c6563=_0x3c6563-0x1a7;let _0x272c21=_0x3a7114[_0x3c6563];return _0x272c21;},_0x3c65(_0x4081bb,_0x367f33);}
function _0x54e3(_0x23f721,_0x247514){const _0x4f4949=_0x3a71();return _0x54e3=function(_0x54e39b,_0x34f6ef){_0x54e39b=_0x54e39b-0x1a7;let _0x2869ec=_0x4f4949[_0x54e39b];return _0x2869ec;},_0x54e3(_0x23f721,_0x247514);}
