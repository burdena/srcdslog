module.exports.parseTime = function(line) {
  var result = line.match(/" (\d\d)\/(\d\d)\/(\d\d\d\d) - (\d\d):(\d\d):(\d\d): /);
  if (!result || result.length == 0) return false;
  return new Date(parseInt(result[3],10), parseInt(result[1],10)-1, parseInt(result[2],10), parseInt(result[4],10), parseInt(result[5],10), parseInt(result[6],10), 0);
};

module.exports.parsePlayer = function(line) {
  var result = line.match(/(.+)<(\d+)><(.+)><?(.+)>/);
  if (!result || result.length == 0) { return false; };
  return { name: result[1], id: parseInt(result[2],10), steamid: result[3], team: result[4] };
};

function parseTime(line) {
  var result = line.match(/" (\d\d)\/(\d\d)\/(\d\d\d\d) - (\d\d):(\d\d):(\d\d): /);
  if (!result || result.length == 0) return false;
  return JSON.stringify(new Date(parseInt(result[3],10), parseInt(result[1],10)-1, parseInt(result[2],10), parseInt(result[4],10), parseInt(result[5],10), parseInt(result[6],10), 0)).replace(/"/g, "");
};

function parseArgs(args) {
  var result = args.match(/[(]([^"]|\\")+ ["]([^"]|\\")+["][)]/g);
  return result;
}

module.exports.parseLineInfo = function(line,callback) {
  /*
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: Team ["](.+)["] triggered ["](.+)["] (.+)/);
  if (result !== null) {
    var lit = { type: 'teamtrigger', trigger: result[2], team: result[1], args: parseArgs(result[3]) };
    // lit[args][result[2]] = result[3];
    return lit;
  }
  */
   //console.log(line);
  
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: World triggered ["](.+)["] on "(.+)"/);
  if (result !== null) {
    return callback({ type: 'worldtrigger', trigger: result[1], map: result[2] });
  }

  // Full match  0-139 `"12/07/2017 - 09:59:17.606 - "Zim<2><BOT><TERRORIST>" [-374 1055 -67] killed "Troy<11><BOT><CT>" [-447 1465 -62] with "galilar" (headshot)"`
  // Group 1.  1-11  `12/07/2017`
  // Group 2.  14-26 `09:59:17.606`
  // Group 3.  30-52 `Zim<2><BOT><TERRORIST>`
  // Group 4.  55-68 `-374 1055 -67`
  // Group 5.  78-95 `Troy<11><BOT><CT>`
  // Group 6.  98-111  `-447 1465 -62`
  // Group 7.  119-126 `galilar`
  var result = line.match(/"(\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d.\d\d\d) - "(.+)" \[(.+)\] killed "(.+)" \[(.+)\] with "(.+)" \(headshot\)"/);
  if(result !== null) {
    return callback({type: 'kill', player: module.exports.parsePlayer(result[3]), location1: result[4], killed: module.exports.parsePlayer(result[5]), location2: result[6], weapon: result[7], hs: true });
  }


  // Match 1
  // Full match  0-59  `"12/06/2017 - 22:09:19.982 - World triggered "Round_Start""`
  // Group 1.  1-11  `12/06/2017`
  // Group 2.  14-26 `22:09:19.982`
  // Group 3.  46-57 `Round_Start`
  var result = line.match(/"(\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d.\d\d\d) - World triggered ["](.+)["]"/);
  if (result !== null) {
    return callback({ type: 'worldtrigger', trigger: result[3] });
  }

  
  
  //Full match  0-85  `"12/07/2017 - 09:49:54.015 - "Tyler<4><BOT><TERRORIST>" triggered "Planted_The_Bomb""`
  // Group 1.  1-11  `12/07/2017`
  // Group 2.  14-26 `09:49:54.015`
  // Group 3.  30-54 `Tyler<4><BOT><TERRORIST>`
  // Group 4.  67-83 `Planted_The_Bomb`
  var result = line.match(/"(\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d.\d\d\d) - "(.+)" triggered ["](.+)["]"/);
  if (result !== null) {
    return callback({ type: 'trigger', player: module.exports.parsePlayer(result[3]) , event: result[4] });  
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d.\d\d\d - "(.+)" purchased ["](.+)["]"/);
  if (result !== null) {
    return callback({ type: 'purchased', player: module.exports.parsePlayer(result[1]) , item: result[2] });  
  }
  

  // Full match  0-85  `"12/07/2017 - 10:08:20.168 - "Wade<6><BOT><TERRORIST>" threw hegrenade [510 1939 98]"`
  // Group 1.  1-11  `12/07/2017`
  // Group 2.  14-26 `10:08:20.168`
  // Group 3.  30-53 `Wade<6><BOT><TERRORIST>`
  // Group 4.  61-70 `hegrenade`
  // Group 5.  72-83 `510 1939 98`
  var result = line.match(/"(\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d.\d\d\d) - "(.+)" threw (.+) \[(.+)\]"/);
  if(result !==  null) {
	return callback({ type: 'threw', player: module.exports.parsePlayer(result[3]) , item: result[4], coords: result[5] });	  
  }
  
  
  // Full match  0-122 `"12/07/2017 - 10:12:40.206 - "Dave<3><BOT><CT>" [516 225 3] killed "Vinny<10><BOT><TERRORIST>" [-143 440 63] with "famas""`
  // Group 1.  1-11  `12/07/2017`
  // Group 2.  14-26 `10:12:40.206`
  // Group 3.  30-46 `Dave<3><BOT><CT>`
  // Group 4.  49-58 `516 225 3`
  // Group 5.  68-93 `Vinny<10><BOT><TERRORIST>`
  // Group 6.  96-107  `-143 440 63`
  // Group 7.  115-121 `famas"`
  var result = line.match(/"(\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d.\d\d\d) - "(.+)" \[(.+)\] killed "(.+)" \[(.+)\] with "(.+)"/);
  if(result !== null) {
	  return callback({type: 'kill', player: module.exports.parsePlayer(result[3]), location1: result[4], killed: module.exports.parsePlayer(result[5]), location2: result[6], weapon: result[7] });
  } 
  
  
  var result = line.match(/"(\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d.\d\d\d) - "(.+)" assisted killing "(.+)""/);
  if(result !== null) {
	  return callback({ type: 'assist', player: module.exports.parsePlayer(result[3]), killed: module.exports.parsePlayer(result[4]) });
  } 

  var result = line.match(/"(\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d.\d\d\d) - "(.+)" left buyzone with \[(.+)\]"/);
  if(result !== null) {
    return callback({ type: 'buyzone', player: module.exports.parsePlayer(result[3]), weapons: result[4] });
  }

  // Full match  0-79  `"12/07/2017 - 10:34:21.088 - rcon from "89.163.146.185:50862": command "stats""`
  // Group 1.  1-11  `12/07/2017`
  // Group 2.  14-26 `10:34:21.088`
  // Group 3.  40-60 `89.163.146.185:50862`
  // Group 4.  72-77 `stats`
  var result = line.match(/"(\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d.\d\d\d) - rcon from "(.+)": command "(.+)""/);
  if(result !== null) {
    return callback({ type: 'cmd', from: result[3], command: result[4] });
  }


  
//   Full match  0-210 `"12/07/2017 - 09:38:15.491 - "Troy<11><BOT><TERRORIST>" [-1258 2193 4] attacked "Ivan<9><BOT><CT>" [-2019 2255 -0] with "galilar" (damage "28") (damage_armor "4") (health "0") (armor "82") (hitgroup "stomach")"`
// Group 1.  1-11  `12/07/2017`   date
// Group 2.  14-26 `09:38:15.491` time
// Group 3.  30-54 `Troy<11><BOT><TERRORIST>` player
// Group 4.  57-69 `-1258 2193 4` location1
// Group 5.  81-97 `Ivan<9><BOT><CT>` player2
// Group 6.  100-113 `-2019 2255 -0` location2
// Group 7.  121-128 `galilar` weapon
// Group 8.  139-141 `28` 
// Group 9.  159-160 `4`
// Group 10. 172-173 `0`
// Group 11. 184-186 `82`
// Group 12. 200-207 `stomach`
  var result = line.match(/"(\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d.\d\d\d) - "(.+)" \[(.+)\] attacked "(.+)" \[(.+)\] with "(.+)" \(damage "(.+)"\) \(damage_armor "(.+)"\) \(health "(.+)"\) \(armor "(.+)"\) \(hitgroup "(.+)"\)"/);
  if(result !== null) {
	  return callback({type: 'attack',  player: module.exports.parsePlayer(result[3]), location1: result[4], damaged: module.exports.parsePlayer(result[5]),location2: result[6], weapon: result[7], damage: parseInt(result[8]), dam_arm: parseInt(result[9]), health: parseInt(result[10]), armour: parseInt(result[11]), hitbox: result[12] });
	  
  }
  
  
    
  if(result == null) {
	  return callback({ type: 'raw', data: line});
  } 
  
  
  /* var result = line.match();
  if(result !== null) {
	  return callback({});
  } */



};


