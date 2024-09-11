import request from "@/utils/request";

const {ElMessage} = require("element-plus");

export default {
    name: "StuInfo",
    data() {
        // 手机号验证
        const checkPhone = (rule, value, callback) => {
            // 11位手机号验证
            const phoneReg = /^1[3|4|5|6|7|8][0-9]{9}$/;
            if (!value) {
                return callback(new Error("电话号码不能为空"));
            }
            setTimeout(() => {
                if (!Number.isInteger(+value)) {
                    callback(new Error("请输入数字值"));
                } else {
                    if (phoneReg.test(value)) {
                        callback();
                    } else {
                        callback(new Error("电话号码格式不正确"));
                    }
                }
            }, 100);
        };
        // 密码一致性验证
        const checkPass = (rule, value, callback) => {
            if (!this.editJudge) {
                if (value == "") {
                    callback(new Error("请再次输入密码"));
                } else if (value !== this.form.password) {
                    callback(new Error("两次输入密码不一致!"));
                } else {
                    callback();
                }
            } else {
                callback();
            }
        };
        return {
            showpassword: true,     // 密码是否可见
            judgeAddOrEdit: true,   // 判断添加还是修改信息
            loading: true,          // 控制加载状态
            editJudge: true,        // 控制编辑模式
            disabled: false,        // 表单是否禁用
            judge: false,           // 判断标志
            dialogVisible: false,   // 表单对话框是否可见
            search: "",             // 查询条件
            currentPage: 1,         // 当前页
            pageSize: 10,           // 每页显示的数据量
            total: 0,               // 数据总量
            tableData: [],
            form: {                 // 表单数据字段
                username: "",
                name: "",
                age: "",
                gender: "",
                phoneNum: "",
                email: "",
            },
            // 表单参数规范性检查
            rules: {
                username: [
                    {required: true, message: "请输入学号", trigger: "blur"},
                    {
                        pattern: /^[a-zA-Z0-9]{4,9}$/,
                        message: "必须由 2 到 5 个字母或数字组成",
                        trigger: "blur",
                    },
                ],
                name: [
                    {required: true, message: "请输入姓名", trigger: "blur"},
                    {
                        pattern: /^(?:[\u4E00-\u9FA5·]{2,10})$/,
                        message: "必须由 2 到 10 个汉字组成",
                        trigger: "blur",
                    },
                ],
                age: [
                    {required: true, message: "请输入年龄", trigger: "blur"},
                    {type: "number", message: "年龄必须为数字值", trigger: "blur"},
                    {
                        pattern: /^(1|[1-9]\d?|100)$/,
                        message: "范围：1-100",
                        trigger: "blur",
                    },
                ],
                gender: [{required: true, message: "请选择性别", trigger: "change"}],
                phoneNum: [{required: true, validator: checkPhone, trigger: "blur"}],
                email: [
                    {type: "email", message: "请输入正确的邮箱地址", trigger: "blur"},
                ],
                password: [
                    {required: true, message: "请输入密码", trigger: "blur"},
                    {
                        min: 6,
                        max: 32,
                        message: "长度在 6 到 16 个字符",
                        trigger: "blur",
                    },
                ],
                checkPass: [{validator: checkPass, trigger: "blur"}],
            },
            editDisplay: {
                display: "block",
            },
            display: {
                display: "none",
            },
        };
    },
    // 创建钩子
    created() {
        this.load();
        this.loading = true;
        setTimeout(() => {
            //设置延迟执行
            this.loading = false;
        }, 1000);
    },
    methods: {
        // 根据搜索条件重新加载数据
        async load() {
            request.get("/stu/find", {
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
        //重置搜索条件
        reset() {
            this.search = ''
            request.get("/stu/find", {
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
        // 筛选性别信息
        filterTag(value, row) {
            return row.gender === value;
        },
        // 学生新增对话框
        add() {
            this.dialogVisible = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();   // 重置表单字段
                this.judgeAddOrEdit = false;
                this.editDisplay = {display: "none"};
                this.disabled = false;
                this.form = {};
                this.judge = false;
            });
        },
        // 学生新增/学生更新表单确认
        save() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    if (this.judge === false) {
                        //学生新增
                        request.post("/stu/add", this.form).then((res) => {
                            console.log(res);
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
                        //学生修改
                        request.put("/stu/update", this.form).then((res) => {
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
        // 取消当前操作，重置表单
        cancel() {
            this.$refs.form.resetFields();
            this.display = {display: "none"};
            this.editJudge = true;
            this.disabled = true;
            this.showpassword = true;
            this.dialogVisible = false;
        },
        // 学生信息修改：修改密码部分
        EditPass() {
            if (this.editJudge) {
                this.showpassword = false;
                this.display = {display: "flex"};
                this.disabled = false;
                this.editJudge = false;
            } else {
                this.showpassword = true;
                this.display = {display: "none"};
                this.editJudge = true;
                this.disabled = true;
            }
        },
        // 学生信息修改，针对每一行
        handleEdit(row) {
            //判断操作类型
            this.judge = true;
            this.dialogVisible = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();
                this.form = JSON.parse(JSON.stringify(row));  // 深拷贝行数据
                this.judgeAddOrEdit = true;
                this.editDisplay = {display: "block"}; // 显示编辑相关元素
                this.disabled = true;
            });
        },
        //学生信息删除
        async handleDelete(username) {
            console.log(username);
            request.delete("/stu/delete/" + username).then((res) => {
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
        //改变每页数据量
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