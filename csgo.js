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


  // Match 1
  // Full match  0-59  `"12/06/2017 - 22:09:19.982 - World triggered "Round_Start""`
  // Group 1.  1-11  `12/06/2017`
  // Group 2.  14-26 `22:09:19.982`
  // Group 3.  46-57 `Round_Start`
  var result = line.match(/"(\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d.\d\d\d) - World triggered ["](.+)["]"/);
  if (result !== null) {
    return callback({ type: 'worldtrigger', trigger: result[3] });
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: rcon from ["](.+)[:](\d+)["][:] command ["](.+)["]/);
  if (result !== null) {
    return callback({ type: 'rcon', address: result[1], port: parseInt(result[2],10), command: result[3] });
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" picked up item ["](.+)["]/);
  if (result !== null) {
    return callback({ type: 'picked up', player: module.exports.parsePlayer(result[1]), item: result[2] });
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: ["](.+)["] committed suicide with ["](.+)["] [(]attacker_position ["](.+) (.+) (.+)["][)]/);
  if (result !== null) {
    return callback({ type: 'suicide', player: module.exports.parsePlayer(result[1]), with: result[2], attacker_position: [parseInt(result[3]), parseInt(result[4]), parseInt(result[5])] });
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" changed role to ["](.+)["]/);
  if (result !== null) {
    return callback({ type: 'changed role', player: module.exports.parsePlayer(result[1]) , role: result[2] });  
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" connected, address ["](.+):(.+)["]/);
  if (result !== null) {
    return callback({ type: 'connected', player: module.exports.parsePlayer(result[1]), ip: result[2], port: parseInt(result[3]) });  
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" STEAM USERID validated/);
  if (result !== null) {
    return callback({ type: 'STEAM USERID validated', player: module.exports.parsePlayer(result[1]) });  
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" disconnected (reason "(.+)")/);
  if (result !== null) {
    return callback({ type: 'disconnected', player: module.exports.parsePlayer(result[1]), reason: result[2] });  
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" joined team ["](.+)["]/);
  if (result !== null) {
    return callback({ type: 'joined team', player: module.exports.parsePlayer(result[1]), team: result[2] });  
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" entered the game/);
  if (result !== null) {
    return callback({ type: 'entered the game', player: module.exports.parsePlayer(result[1]) });  
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: Started map "(.+)"\(CRC "(.+)"\)/);
  if (result !== null) {
    return callback({ type: 'changemap', map: result[1], crc: result[2] });  
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: Team "(.+)" current score "(\d+)" with "(\d+)" players/);
  if (result !== null) {
    return callback({ type: 'currentScore', team: result[1], score: parseInt(result[2]), players: parseInt(result[3]) })
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: Team "(.+)" final score "(\d+)" with "(\d+)" players/);
  if (result !== null) {
    return callback({ type: 'finalScore', team: result[1], score: parseInt(result[2]), players: parseInt(result[3]) })
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" spawned as ["](.+)["]/);
  if (result !== null) {
   return callback({ type: 'spawned', player: module.exports.parsePlayer(result[1]), role: result[2] });
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" say ["](.+)["]/);
  if (result !== null) {
    return callback({ type: 'say', player: module.exports.parsePlayer(result[1]), text: result[2] });
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" say_team ["](.+)["]/);
  if (result !== null) {
    return callback({ type: 'say_team', player: module.exports.parsePlayer(result[1]), text: result[2] });
  }

  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" position_report (.+)/);
  if (result !== null) {
    return callback({ type: 'position_report', player: module.exports.parsePlayer(result[1]), text: parseArgs(result[2]) });
  }

  //Example:  'L 09/16/2012 - 20:19:02: "Grant<9><BOT><CT>" killed "Alfred<6><BOT><TERRORIST>" with "hkp2000" (headshot)'
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" killed "(.+)" with ["](.+)["] (\(headshot\))\n\u0000/);
   if (result !== null) {
    return callback({ type: 'kill', player: module.exports.parsePlayer(result[1]), killed: module.exports.parsePlayer(result[2]), weapon: result[3], headshot:  true});
  }
  
  //Example: 'L 09/16/2012 - 20:19:02: "Grant<9><BOT><CT>" killed "Alfred<6><BOT><TERRORIST>" with "hkp2000"'
  var result = line.match(/" (\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d:) "(.+)" killed "(.+)" with ["](.+)["]\n\u0000/);
   if (result !== null) {
    return callback({ time: result[2], type: 'kill', player: module.exports.parsePlayer(result[3]), killed: module.exports.parsePlayer(result[4]), weapon: result[5], headshot: false });
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
  
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" threw (.+) \[(.+)\]/);
  if(result !==  null) {
	return callback({ type: 'threw', player: module.exports.parsePlayer(result[1]) , item: result[2], coords: result[3] });	  
  }
  
  
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: Team "(.+)" scored "(.+)" with "(.+)"/);
  if(result !== null) {
	  return callback({type: 'teamscore', team: result[1], score: parseInt(result[2]), players: parseInt(result[3])});
  }
    
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" (\[.+\]) killed "(.+)" (\[.+\]) with "(.+)"/);
  if(result !== null) {
	  return callback({type: 'kill', player: module.exports.parsePlayer(result[1]), from: result[2], killed: module.exports.parsePlayer(result[3]), end: result[4], weapon: result[5] });
  } 
  
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" (\[.+\]) killed "(.+)" (\[.+\]) with "(.+)"\(penetrated\)/);
  if(result !== null) {
	  return callback({type: 'kill', player: module.exports.parsePlayer(result[1]), from: result[2], killed: module.exports.parsePlayer(result[3]), end: result[4], weapon: result[5], wallbang: true });
  }
  
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" (\[.+\]) killed "(.+)" (\[.+\]) with "(.+)"\(headshot penetrated\)/);
  if(result !== null) {
	  return callback({type: 'kill', player: module.exports.parsePlayer(result[1]), from: result[2], killed: module.exports.parsePlayer(result[3]), end: result[4], weapon: result[5], wallbang: true });
  }
  
   var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" assisted killing "(.+)"/);
  if(result !== null) {
	  return callback({ type: 'assist', player: module.exports.parsePlayer(result[1]), killed: module.exports.parsePlayer(result[2]) });
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
  
  //L 05/06/2015 - 19:08:16: "Derek<6><BOT><TERRORIST>" [-1416 1895 13] attacked "Xavier<5><BOT><CT>" [-1676 2492 7] with "galilar" (damage "28") (damage_armor "4") (health "49") (armor "91") (hitgroup "stomach") (penetrated)
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" (\[.+\]) attacked "(.+)" (\[.+\]) with "(.+)"\(damage "(.+)"\) \(damage_armor "(.+)"\) \(health "(.+)"\) \(armor "(.+)"\) \(hitgroup "(.+)"\) (penetrated)/);
  if(result !== null) {
	  return callback({type: 'attack', player: module.exports.parsePlayer(result[1]), fired: result[2], damaged: module.exports.parsePlayer(result[3]),to: result[4], weapon: result[5], damage: parseInt(result[6]), dam_arm: parseInt(result[7]), health: parseInt(result[8]), armour: parseInt(result[9]), hitbox: result[10], wallbang: true  });
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
  
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: Team .+ triggered .+ \(CT "(.+)"\) \(T "(.+)"\)/);
  if(result !== null) {
	  return callback({type: 'score', ct: result[1], t:result[2]});
  } 
  
  //L \d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" switched from team <(.+)> to <(.+)>
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" switched from team <(.+)> to <(.+)>/);
  if(result !== null) {
	  return callback({type: 'switch', player: module.exports.parsePlayer(result[1]), from: result[2], to: result[3]});
  }
  
  //L 05/07/2015 - 20:15:30: "sv_maxspeed" = "320"
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" = "(.*)"/);
  if(result !== null) {
	  return callback({type: 'cvar', setting: result[1], value: result[2]});
  }
  
  //L 05/07/2015 - 19:57:54: Molotov projectile spawned at -1070.354736 1349.993164 -123.753937, velocity 56.378204 -672.145020 177.812332
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: Molotov projectile spawned at (.+), velocity (.+)/);
  if(result !== null) {
	  return callback({type: 'molo', loco: result[1], vel: result[2]});
  }
  
  //L 05/08/2015 - 10:07:15: server_cvar: "cash_team_rescued_hostage" "0"
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: server_cvar: "(.+)" "(.*)"/);
  if(result !== null) {
	  return callback({type: 'server_cvar', setting: result[1], value: result[2]});
  }
  
  //L 05/08/2015 - 10:07:16: "B3rt<33><STEAM_1:0:4551962><>" connected, address \"\"
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" connected,/);
  if(result !== null) {
	  return callback({type: 'connected', player: module.exports.parsePlayer(result[1])});
  }
  
  //L 05/08/2015 - 10:16:20: "B3rt<33><STEAM_1:0:4551962><CT>" disconnected (reason "Disconnect")
  var result = line.match(/L \d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: "(.+)" disconnected \(reason "(.+)"\)/);
  if(result !== null) {
	  return callback({type: 'disconnected', player: module.exports.parsePlayer(result[1]), reason: result[2] });
  }
  
  //L 05/08/2015 - 10:56:25: server_message: "quit"
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: server_message: "(.+)"/);
  if(result !== null) {
	  return callback({type: 'server_message', message: result[1]});
  }
  
  //L \d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: Log file closed
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: Log file closed/);
  if(result !== null) {
	  return callback({type: 'log', action: 'closed'});
  }
 
  //L 05/09/2015 - 13:34:02: Loading map "workshop/125438255/de_dust2"
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: Loading map "(.+)"/);
  if(result !== null) {
	  return callback({type: 'map', map: result[1]});
  }   
  
  //L 05/14/2015 - 08:26:51: server cvars start
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: server cvars (.+)/);
  if(result !== null) {
	  return callback({type: 'scvar', action: result[1]});
  }
  
  //L 05/14/2015 - 09:45:13: Log file started (file "logfiles/L172_017_014_158_19141_201505140945_002.log") (game "/csgo_ds/csgo") (version "6016")
  var result = line.match(/"\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: Log file started \(file "(.+)"\) \(game "(.+)"\) \(version "(.+)"\)/);
  if(result !== null) {
	  return callback({type: 'log', action: 'started', file: result[1]});
  } 
    
  if(result == null) {
	  return callback({ type: 'raw', data: line});
  } 
  
  
  /* var result = line.match();
  if(result !== null) {
	  return callback({});
  } */



};


