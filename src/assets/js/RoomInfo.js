import request from "@/utils/request";

const {ElMessage} = require("element-plus");

export default {
    name: "RoomInfo",
    components: {},
    data() {
        // 入住信息检查：检验学生是否存在，是否已有床位
        const checkStuNum = (rule, value, callback) => {
            request.get("/stu/exist/" + value).then((res) => {
                request.get("/room/judgeHadBed/" + value).then((result) => {
                    if (res.code === "0" && result.code === "0") {
                        callback();
                    } else if (res.code === "-1" && result.code === "0") {
                        callback(new Error(res.msg));
                    } else if (res.code === "0" && result.code === "-1") {
                        callback(new Error(result.msg));
                    } else {
                        callback(new Error("请输入正确的数据"));
                    }
                });
            });
        };
        return {
            bedNum: 0,                  // 床位号
            havePeopleNum: 0,           // 房间已有人数
            loading: true,              // 控制加载状态
            disabled: false,            // 表单是否禁用
            judge: false,               // 判断标志，区分新增和修改
            dialogVisible: false,       // 房间信息对话框是否可见
            bedDialog: false,           // 床位信息对话框
            stuInfoDialog: false,       // 学生入住信息对话框
            bedName: "",
            search: "",
            currentPage: 1,             // 分页信息
            pageSize: 10,
            total: 0,
            tableData: [],
            form: {
                dormRoomId: "",         // 房间号
                dormBuildId: "",        // 楼栋号
                floorNum: "",           // 楼层
                maxCapacity: "",        // 房间最多可住人数
                currentCapacity: "",    // 已住人数
                firstBed: "",           // 床位号
                secondBed: "",
                thirdBed: "",
                fourthBed: "",
            },
            // 表单参数规范性检查
            rules: {
                dormRoomId: [
                    {required: true, message: "请输入房间号", trigger: "blur"},
                    {pattern: /^[0-9]{4}$/, message: "范围：1000-9999", trigger: "blur"},
                ],
                floorNum: [
                    {required: true, message: "请输入楼层数", trigger: "blur"},
                    {pattern: /^[1-3]$/, message: "范围：1-3", trigger: "blur"},
                ],
                dormBuildId: [
                    {required: true, message: "请输入楼宇号数", trigger: "blur"},
                    {pattern: /^[1-4]$/, message: "范围：1-4", trigger: "blur"},
                ],
                maxCapacity: [
                    {required: true, message: "请输入房间可住人数", trigger: "blur"},
                    {pattern: /^[0-4]$/, message: "范围：0-4", trigger: "blur"},
                ],
                currentCapacity: [
                    {required: true, message: "请输入当前已住人数", trigger: "blur"},
                    {pattern: /^[0-4]$/, message: "范围：0-4", trigger: "blur"},
                ],
                firstBed: [{validator: checkStuNum, trigger: "blur"}],
                secondBed: [{validator: checkStuNum, trigger: "blur"}],
                thirdBed: [{validator: checkStuNum, trigger: "blur"}],
                fourthBed: [{validator: checkStuNum, trigger: "blur"}],
            },
        };
    },
    created() {
        this.load();
        this.loading = true;
        setTimeout(() => {
            //设置延迟执行
            this.loading = false;
        }, 1000);
    },
    methods: {
        // 根据搜索条件加载数据
        async load() {
            request.get("/room/find", {
                params: {
                    pageNum: this.currentPage,
                    pageSize: this.pageSize,
                    search: this.search,
                },
            }).then((res) => {
                this.tableData = res.data.records;
                this.total = res.data.total;
                this.loading = false;
            });
        },
        // 重置搜索条件
        reset() {
            this.search = ''
            request.get("/room/find", {
                params: {
                    pageNum: 1,
                    pageSize: this.pageSize,
                    search: this.search,
                },
            }).then((res) => {
                console.log(res);
                this.tableData = res.data.records;
                this.total = res.data.total;
                this.loading = false;
            });
        },
        // 筛选特定已住人数的房间号
        filterTag(value, row) {
            return row.currentCapacity === value;
        },
        // 房间新增
        add() {
            this.dialogVisible = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();
                this.disabled = false;
                this.form = {};
                this.judge = false;
            });
        },
        // 房间新增、房间修改表单确认
        save() {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    if (this.judge === false) {
                        //新增
                        request.post("/room/add", this.form).then((res) => {
                            if (res.code === "0") {
                                ElMessage({
                                    message: "新增成功",
                                    type: "success",
                                });
                                this.search = "";
                                this.loading = true;
                                this.load();
                                this.dialogVisible = false;
                            } else {
                                ElMessage({
                                    message: res.msg,
                                    type: "error",
                                });
                            }
                        });
                    } else {
                        //修改
                        request.put("/room/update", this.form).then((res) => {
                            if (res.code === "0") {
                                ElMessage({
                                    message: "修改成功",
                                    type: "success",
                                });
                                this.search = "";
                                this.load();
                                this.dialogVisible = false;
                            } else {
                                ElMessage({
                                    message: res.msg,
                                    type: "error",
                                });
                            }
                        });
                    }
                }
            });
        },
        // 取消当前操作
        cancel() {
            this.$refs.form.resetFields();
            this.dialogVisible = false;
            this.bedDialog = false;
            this.stuInfoDialog = false;
        },
        // 房间信息修改，针对每一行
        handleEdit(row) {
            this.judge = true;
            this.dialogVisible = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();
                this.form = JSON.parse(JSON.stringify(row));    // 深拷贝行数据
                this.disabled = true;
            });
        },
        // 房间信息删除
        handleDelete(dormRoomId) {
            request.delete("/room/delete/" + dormRoomId).then((res) => {
                if (res.code === "0") {
                    ElMessage({
                        message: "删除成功",
                        type: "success",
                    });
                    this.search = "";
                    this.load();
                } else {
                    ElMessage({
                        message: res.msg,
                        type: "error",
                    });
                }
            });
        },
        // 获取房间人数
        calCurrentNum(info) {
            this.havePeopleNum = 0;
            let roomPeopleNum = 0;
            if (info.firstBed != null) {
                roomPeopleNum++;
            }
            if (info.secondBed != null) {
                roomPeopleNum++;
            }
            if (info.thirdBed != null) {
                roomPeopleNum++;
            }
            if (info.fourthBed != null) {
                roomPeopleNum++;
            }
            this.havePeopleNum = roomPeopleNum;
        },
        //添加入住信息图标
        plusIcon(num, info) {
            this.judge = false;
            //显示对应床位input
            this.bedNum = num;
            //获取当前房间人数
            this.calCurrentNum(info);
            this.bedDialog = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();
                this.form = JSON.parse(JSON.stringify(info));
            });
        },
        //修改入住信息图标
        editIcon(num, info) {
            this.judge = true;
            //显示对应床位input
            this.bedNum = num;
            this.bedDialog = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();
                this.form = JSON.parse(JSON.stringify(info));
            });
        },
        // 查看入住详细信息
        detailIcon(num, info) {
            let stu = "";
            if (num === 1) {
                stu = info.firstBed;
            } else if (num === 2) {
                stu = info.secondBed;
            } else if (num === 3) {
                stu = info.thirdBed;
            } else if (num === 4) {
                stu = info.fourthBed;
            }
            request.get("/stu/exist/" + stu).then((res) => {
                if (res.code === "0") {
                    this.stuInfoDialog = true;
                    this.$nextTick(() => {
                        this.$refs.form.resetFields();
                        this.form = JSON.parse(JSON.stringify(res.data));
                    });
                }
            });
        },
        // 为床位添加学生入住信息
        addStuBed() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.form.currentCapacity = this.havePeopleNum + 1;
                    request.put("/room/update", this.form).then((res) => {
                        if (res.code === "0") {
                            ElMessage({
                                message: "新增成功",
                                type: "success",
                            });
                            this.search = "";
                            this.loading = true;
                            this.load();
                            this.bedDialog = false;
                        } else {
                            ElMessage({
                                message: res.msg,
                                type: "error",
                            });
                        }
                    });
                }
            });
        },
        // 修改入住床位信息
        editStuBed() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    request.put("/room/update", this.form).then((res) => {
                        if (res.code === "0") {
                            ElMessage({
                                message: "修改成功",
                                type: "success",
                            });
                            this.search = "";
                            this.loading = true;
                            this.load();
                            this.bedDialog = false;
                        } else {
                            ElMessage({
                                message: res.msg,
                                type: "error",
                            });
                        }
                    });
                }
            });
        },
        // 删除床位信息
        async deleteStuBed(bedNum, info) {
            let bedName = "";
            // 删除
            if (bedNum === 1) {
                bedName = "first_bed";
            } else if (bedNum === 2) {
                bedName = "second_bed";
            } else if (bedNum === 3) {
                bedName = "third_bed";
            } else if (bedNum === 4) {
                bedName = "fourth_bed";
            }
            //更新当前房间人数
            this.calCurrentNum(info);
            request.delete(
                "/room/delete/" +
                bedName +
                "/" +
                info.dormRoomId +
                "/" +
                this.havePeopleNum
            ).then((res) => {
                if (res.code === "0") {
                    ElMessage({
                        message: "删除成功",
                        type: "success",
                    });
                    this.search = "";
                    this.loading = true;
                    this.load();
                    this.bedDialog = false;
                } else {
                    ElMessage({
                        message: res.msg,
                        type: "error",
                    });
                }
            });
        },
        // 改变每页数据量
        handleSizeChange(pageSize) {
            this.pageSize = pageSize;
            this.load();
        },
        //改变页码
        handleCurrentChange(pageNum) {
            this.currentPage = pageNum;
            this.load();
        },
    },
};