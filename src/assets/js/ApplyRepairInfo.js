import request from "@/utils/request";

const {ElMessage} = require("element-plus");

export default {
    name: "ApplyRepairInfo",
    components: {},
    data() {
        return {
            loading: true,              // 控制加载状态
            dialogVisible: false,       // 对话框是否可见
            detailDialog: false,        // 报修详情对话框
            search: "",
            currentPage: 1,             // 分页信息
            pageSize: 10,
            total: 0,
            tableData: [],
            detail: {},                 // 报修详情
            name: '',
            username: '',
            form: {},
            room: {
                dormRoomId: '',         // 宿舍号
                dormBuildId: '',        // 房间号
            },
            //  表单输入参数规范性检查
            rules: {
                title: [{required: true, message: "请输入标题", trigger: "blur"}],
                content: [{required: true, message: "请输入内容", trigger: "blur"}],
                orderBuildTime: [{required: true, message: "请选择时间", trigger: "blur"},],
            },
        };
    },
    created() {
        this.init()
        this.getInfo()
        this.load()
        this.loading = true
        setTimeout(() => {
            //设置延迟执行
            this.loading = false
        }, 1000);
    },
    methods: {
        // 初始化
        init() {
            this.form = JSON.parse(sessionStorage.getItem("user"));
            this.name = this.form.name;
            this.username = this.form.username;
        },
        // 根据搜索条件加载数据
        async load() {
            request.get("/repair/find/" + this.name, {
                params: {
                    pageNum: this.currentPage,
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
        // 获取当前学生房间信息
        getInfo() {
            request.get("/room/getMyRoom/" + this.username).then((res) => {
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
        // 筛选报修信息状态
        filterTag(value, row) {
            return row.state === value;
        },
        // 报修详情
        showDetail(row) {
            this.detailDialog = true;
            this.$nextTick(() => {
                this.detail = row;
            });
        },
        // 关闭报修详情
        closeDetails() {
            this.detailDialog = false;
        },
        // 报修新增
        add() {
            this.dialogVisible = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();
                this.form.repairer = this.name
                this.form.dormBuildId = this.room.dormBuildId
                this.form.dormRoomId = this.room.dormRoomId
            });
        },
        // 报修信息新增和修改表单确认
        save() {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    //新增
                    console.log(this.form)
                    await request.post("/repair/add", this.form).then((res) => {
                        if (res.code === "0") {
                            ElMessage({
                                message: "新增成功",
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
            })
        },
        // 取消当前操作
        cancel() {
            this.$refs.form.resetFields();
            this.dialogVisible = false;
        },
        // 改变每页数据量
        handleSizeChange(pageSize) {
            this.pageSize = pageSize;
            this.load();
        },
        // 改变页码
        handleCurrentChange(pageNum) {
            this.currentPage = pageNum;
            this.load();
        },
    },
};