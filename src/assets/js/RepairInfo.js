import request from "@/utils/request";

const {ElMessage} = require("element-plus");

export default {
    name: "RepairInfo",
    components: {},
    data() {
        const checkOrderState = (rule, value, callback) => {
            if (this.judge) {
                if (value === "未完成" && this.form.orderFinishTime === null) {
                    callback();
                } else if (value === "完成" && this.form.orderFinishTime !== null) {
                    callback();
                } else {
                    callback(new Error("请检查订单完成状态与选择时间是否匹配"));
                }
            } else {
                callback();
            }
        };
        return {
            buildTimeDisabled: true,    // 报修订单创建时间
            loading: true,              // 控制加载状态
            disabled: false,            // 表单是否禁用
            judge: false,               // 判断标志，区分新增和修改
            dialogVisible: false,       // 对话框是否可见
            detailDialog: false,        // 报修详情对话框
            search: "",
            currentPage: 1,             // 分页信息
            pageSize: 10,
            total: 0,
            tableData: [],
            detail: {},                 // 公告详情
            form: {},
            //  表单输入参数规范性检查
            rules: {
                title: [{required: true, message: "请输入标题", trigger: "blur"}],
                content: [{required: true, message: "请输入内容", trigger: "blur"}],
                repairer: [
                    {required: true, message: "请输入申请人", trigger: "blur"},
                ],
                orderBuildTime: [
                    {required: true, message: "请选择时间", trigger: "blur"},
                ],
                state: [{validator: checkOrderState, trigger: "blur"}],
            },
            // 报修订单完成时间
            finishTime: {
                display: "none",
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
            request.get("/repair/find", {
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
        // 重置搜索条件
        reset() {
            this.search = ''
            request.get("/repair/find", {
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
                this.buildTimeDisabled = false;
                this.finishTime = {display: "none"};
                this.disabled = false;
                this.form = {};
                this.judge = false;
            });
        },
        // 报修信息新增和修改表单确认
        save() {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    if (this.judge === false) {
                        //新增
                        await request.post("/repair/add", this.form).then((res) => {
                            console.log(res);
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
                    } else {
                        //修改
                        await request.put("/repair/update", this.form).then((res) => {
                            console.log(res);
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
        },
        // 报修信息修改
        handleEdit(row) {
            this.judge = true;
            this.dialogVisible = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();
                // 生拷贝
                this.form = JSON.parse(JSON.stringify(row));
                this.disabled = true;
                this.buildTimeDisabled = true;
                this.finishTime = {display: "flex"};
            });
        },
        // 报修信息删除
        handleDelete(id) {
            console.log(id);
            request.delete("/repair/delete/" + id).then((res) => {
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