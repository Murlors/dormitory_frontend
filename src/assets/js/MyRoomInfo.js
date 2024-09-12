import request from "@/utils/request";

const {ElMessage} = require("element-plus");

export default {
    name: "MyRoomInfo",
    data() {
        return {
            name: "",
            form: {
                username: "",
            },
            room: {
                dormRoomId: "",         // 房间号
                dormBuildId: "",        // 楼宇号
                floorNum: "",           // 楼层
                maxCapacity: "",        // 可住人数
                currentCapacity: "",    // 已住人数
                firstBed: "",           // 各床位信息
                secondBed: "",
                thirdBed: "",
                fourthBed: "",
            },
        };
    },
    created() {
        this.init();
        this.getInfo();
    },
    methods: {
        // 初始化
        init() {
            this.form = JSON.parse(sessionStorage.getItem("user"));
            this.name = this.form.username;
        },
        // 学生端获取我的宿舍信息
        getInfo() {
            request.get("/room/getMyRoom/" + this.name).then((res) => {
                if (res.code === "0") {
                    this.room = res.data;
                    console.log(this.room);
                } else {
                    ElMessage({
                        message: res.msg,
                        type: "error",
                    });
                }
            });
        },
    },
};