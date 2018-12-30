pragma solidity ^0.4.25;
contract KillWolf{
    //指示谁是法官
    address public judge;
    //存储任务角色，分别是狼人、村民
    string[] roles = ["werewolf", "villager", "villager"];
    //存储角色名字
    string[] names = ["Mike", "Jack", "Tom", "Jerry", "Sherluck"];
    //指示游戏是否已经开始
    bool public game_is_on;
    //指示游戏是否处于夜间
    bool public if_night;
    //指示狼人数量
    uint public wolf_counts;
    //指示好人数量
    uint public man_counts;
    //指示是第几天
    uint public day_of_game;
    //定义事件
    event transfer(address indexed _from, address indexed _to, uint f);

    //定义玩家结构体
    struct player {
        address addr;//玩家地址
        string name;//玩家姓名或者说是代号
        string role;//玩家的角色
        string word;//玩家说的话
        uint kill_votes;//在夜晚狼人投票中所得的票数
        uint wolf_votes;//在白天投狼人票中所得的票数
        bool if_live;//标记玩家是否生存
        bool if_night_vote;//标记玩家在夜晚中是否投票
        bool if_day_vote;//标记玩家在白天中是否投票
        bool if_say;//标记玩家在某轮游戏中是否发言
    }

    //比较两个字符串是否相等
    function is_equal(string a, string b) internal pure returns (bool) {
        if (bytes(a).length != bytes(b).length) {
            return false;
        }
        for (uint i = 0; i < bytes(a).length; i ++) {
            if(bytes(a)[i] != bytes(b)[i]) {
                return false;
            }
        }
        return true;
    }

    //定义发言结构体
    struct saying {
        uint day;//发言天数
        string name;//发言者姓名或者说是代号
        string content;//发言内容
    }

    //定义发言数组
    saying[] public sayings;

    //定义玩家数组
    player[] public players;

    //定义地址与所在玩家数组中位置下标之间的映射
    mapping(address=>uint) public indexs;

    //定义名字与地址之间的报错
    mapping(string=>address) Names;

    //定义地址与加入状态之间的映射
    mapping(address=>uint) Flag;//标记玩家是否已加入，加入为1

    //由法官初始化时输入玩的人数
    constructor() public {
        //要求玩的人数必须大于角色数量
        //require(counts >= roles.length, "the number of players is not enough!");
        //游戏发起者为法官
        judge = msg.sender;
        //定义游戏为未开始状态
        game_is_on = false;
        //狼人数量为0
        wolf_counts = 0;
        //好人数量为0
        man_counts = 0;
        //加入游戏
        Flag[msg.sender] = 1;
        indexs[msg.sender] = 0;
        players.push(player({addr: msg.sender, name:"judge", role:"judge", word:"", kill_votes:0, wolf_votes:0,if_live:true, if_night_vote:false, if_day_vote:false,if_say:false}));
    }

    //法官邀请玩家加入游戏， 参数为新玩家的地址和代号
    function add_players(address newplayer) public {
        transfer(msg.sender, newplayer, 1);
        //要求发起者必须是法官
        require(msg.sender == judge, "you don't have the right!");
        //要求必须在游戏正式开始前加人
        transfer(msg.sender, newplayer, 2);
        require(game_is_on == false, "the game is on!");
        //要求人之前没有加过
        transfer(msg.sender, newplayer, 3);
        require(Flag[newplayer] == 0, "you have added the player!");
        transfer(msg.sender, newplayer, 4);
        //要求代号之前没有起过
        //require(Names[hisname]==address(0), "the name has been used!");
        uint newindex = 0;
        //确保除了狼人和村民之外的角色只会出现一次
        uint len = players.length-1;
        if (len >= roles.length) {
            newindex = len%2;
        }
        else {
            newindex = len;
        }
        if (newindex == 0) {
            wolf_counts = wolf_counts+1;
        }
        else {
            man_counts = man_counts+1;
        }
        players.push(player({addr: newplayer, name:names[len], role:roles[newindex], word:"", kill_votes:0, wolf_votes:0,if_live:true, if_night_vote:false, if_day_vote:false,if_say:false}));
        Names[names[len]] = newplayer;
        indexs[newplayer] = len+1;
        Flag[newplayer] = 1;
    }

    //法官宣布游戏开始
    function start_game() public {
        //要求发起者必须是法官
        require(msg.sender == judge, "you don't have the right!");
        //要求玩的人数必须大于角色数量
        require(players.length >= roles.length, "the number of players is not enough!");
        //游戏正式开始
        game_is_on = true;
        //进入夜间
        if_night = true;
        //进入第一天
        day_of_game = 1;
    }

    //获取狼人数量
    function get_counts_wolf() public view returns (uint) {
        //要求游戏必须开始
        require(game_is_on == true, "the game is not on!");
        //要求已经加入游戏
        require(Flag[msg.sender] == 1, "you haven't joined the game!");
        return wolf_counts;
    }

    //获取好人数量
    function get_counts_man() public view returns (uint) {
        //要求游戏必须开始
        require(game_is_on == true, "the game is not on!");
        //要求已经加入游戏
        require(Flag[msg.sender] == 1, "you haven't joined the game!");
        return man_counts;
    }

    //狼人投票
    function vote_for_man(address hisaddress) public {
        //要求游戏必须开始
        require(game_is_on == true, "the game is not on!");
        //要求已经加入游戏
        require(Flag[msg.sender] == 1, "you haven't joined the game!");
        //判断此时是否是白天
        //require(if_night == true, "it's daytime now!");
        //判断身份是否是狼人
        require(is_equal(players[indexs[msg.sender]].role, "werewolf"), "you are not a wolf!");
        //判断是否已经投过票
        require(players[indexs[msg.sender]].if_night_vote == false, "you have voted!");
        //判断被投者是否存在
        //require(Names[hisname] != address(0), "the name doesn't exist!"); 
        //判断被投者是否存活
        //require(players[indexs[Names[hisname]]].if_live == true, "the guy has died!");
        //判断投票者是否存活
        require(players[indexs[msg.sender]].if_live == true, "you have died!");
        players[indexs[hisaddress]].kill_votes = players[indexs[hisaddress]].kill_votes+1;
        players[indexs[msg.sender]].if_night_vote = true;
    }

    //谁是狼人
    function if_is_wolf(string hisname) public view returns(bool) {
        //要求游戏必须开始
        require(game_is_on == true, "the game is not on!");
        //要求已经加入游戏
        require(Flag[msg.sender] == 1, "you haven't joined the game!");
        //要求发起查询者必须是法官或者是狼人
        require(msg.sender == judge || is_equal(players[indexs[msg.sender]].role, "werewolf"), "you don't have the right!");
        //判断被查询者是否存在
        require(Names[hisname] != address(0), "the name doesn't exist!"); 
        return is_equal(players[indexs[Names[hisname]]].role, "werewolf");
    }

    //宣布天亮了,返回死的人的名字
    function Day_breaks() public returns(string) {
        //要求已经加入游戏
        require(Flag[msg.sender] == 1, "you haven't joined the game!");
        //要求发起者必须是法官
        require(msg.sender == judge, "you don't have the right!");
        //要求游戏必须开始
        require(game_is_on == true, "the game is not on!");
        //要求此时必须是黑夜
        require(if_night == true, "it's daytime now!");
        //要求所有狼人都已经投票
        bool if_all = true;
        uint i = 0;
        for (i = 1; i < players.length; i++) {
            if (is_equal(players[i].role, "werewolf") && players[i].if_night_vote == false && players[i].if_live == true) {
                if_all = false;
                break;
            }
        }
        require(if_all == true, "some werewolves haven't voted");
        uint max_votes = 0;//最大票数
        string memory deadname = "";//死者姓名
        for (i = 1; i < players.length; i++) {
            if (players[i].kill_votes > max_votes && players[i].if_live == true) {
                max_votes = players[i].kill_votes;
                deadname = players[i].name;
            }
            //状态恢复
            players[i].kill_votes = 0;
            players[i].if_night_vote = false;
        }
        players[indexs[Names[deadname]]].if_live = false;
        if (is_equal(players[indexs[Names[deadname]]].role, "werewolf")) {
            wolf_counts = wolf_counts-1;
        }
        else {
            man_counts = man_counts-1;
        }
        if_night = false;
        //判断游戏是否结束
        if (wolf_counts == 0 || man_counts == 0) {
            game_is_on = false;
        }
        //进入第二天
        day_of_game = day_of_game+1;
        return deadname;
    }

    //进入发言环节
    function player_saying(string words) public {
        //加入发言内容
        //sayings.push(saying({day:day_of_game, name:players[indexs[msg.sender]].name, content:words}));
        //重置已经说过话的状态
        players[indexs[msg.sender]].word = words;
    }

    //进入白天投票的环节
    function vote_for_wolf(address hisaddress) public {
        // //要求游戏必须开始
        // if (game_is_on == true) {
        //     return "the game is not on!";
        // }
        // //要求已经加入游戏
        // if (Flag[msg.sender] == 1) {
        //     return "you haven't joined the game!";
        // }
        // //判断此时是否是白天
        // if (if_night == false) {
        //     return "it's nighttime now!";
        // }
        // //判断是否已经投过票
        // if (players[indexs[msg.sender]].if_day_vote == false) {
        //     return "you have voted!";
        // }
        // //判断被投者是否存在
        // require(Names[hisname] != address(0), "the name doesn't exist!"); 
        // //判断被投者是否存活
        // require(players[indexs[Names[hisname]]].if_live == true, "the guy has died!");
        // //判断投票者是否存活
        // require(players[indexs[msg.sender]].if_live == true, "you have died!");
        // //要求所有人都已经发言
        // bool if_all = true;
        // uint i = 0;
        // for (i = 0; i < players.length; i++) {
        //     if (players[i].if_say == false && players[i].if_live == true) {
        //         if_all = false;
        //         break;
        //     }
        // }
        // require(if_all == true, "someone hasn't said!");
        players[indexs[hisaddress]].wolf_votes = players[indexs[hisaddress]].wolf_votes+1;
        players[indexs[msg.sender]].if_day_vote = true;
    }

    //宣布天黑请闭眼,返回被当做狼人投死的人的名字
    function Day_over() public returns(string) {
        //要求已经加入游戏
        require(Flag[msg.sender] == 1, "you haven't joined the game!");
        //要求发起者必须是法官
        require(msg.sender == judge, "you don't have the right!");
        //要求游戏必须开始
        require(game_is_on == true, "the game is not on!");
        //要求此时必须是白天
        require(if_night == false, "it's daytime now!");
        //要求所有人都已经投票
        bool if_all = true;
        uint i = 0;
        for (i = 1; i < players.length; i++) {
            if (players[i].if_day_vote == false && players[i].if_live == true) {
                if_all = false;
                break;
            }
        }
        require(if_all == true, "someone hasn't voted");
        uint max_votes = 0;//最大票数
        string memory deadname = "";//死者姓名
        for (i = 1; i < players.length; i++) {
            if (players[i].wolf_votes > max_votes && players[i].if_live == true) {
                max_votes = players[i].wolf_votes;
                deadname = players[i].name;
            }
            //状态恢复
            players[i].wolf_votes = 0;
            players[i].if_day_vote = false;
            players[i].if_say = false;
        }
        players[indexs[Names[deadname]]].if_live = false;
        if (is_equal(players[indexs[Names[deadname]]].role, "werewolf")) {
            wolf_counts = wolf_counts-1;
        }
        else {
            man_counts = man_counts-1;
        }
        if_night = true;
        //判断游戏是否结束
        if (wolf_counts == 0 || man_counts == 0) {
            game_is_on = false;
        }
        return deadname;
    }

    //获取游戏结果
    function get_result() public view returns(string) {
        //要求已经加入游戏
        require(Flag[msg.sender] == 1, "you haven't joined the game!");
        //要求游戏必须结束
        //require(game_is_on == false, "the game is still on!");
        if (game_is_on == true) {
            return "";
        }
        //返回结果
        if (wolf_counts < man_counts) {
            return "村民胜!";
        }
        else {
            return "狼人胜!";
        }
    }

    //对角色进行查询
    function query_role(address addr) public view returns(string) {
        if (Flag[addr] == 0) {
            return "等待邀请中···";
        }
        else {
            return players[indexs[addr]].role;
        }
    }
    //对地址对应的编号进行查询
    function query_number(address addr) public view returns(uint) {
        return indexs[addr];
    }
    //对编号对应的地址进行查询
    function query_address(uint i) public view returns(address) {
        return players[i].addr;
    }
    //返回玩家总数
    function query_total()public view returns(uint) {
        return players.length;
    }
    //返回存活信息
    function query_lives(uint i) public view returns(bool) {
        return players[i].if_live;
    }
    //返回玩家说的话
    function query_word(uint i) public view returns(string) {
        return players[i].word;
    }
    //返回白天投票结果
    function query_dvote(uint i)public view returns(uint) {
        return players[i].wolf_votes;
    }
    //返回夜晚投票结果
    function query_nvote(uint i)public view returns(uint) {
        return players[i].kill_votes;
    }
} 