
import Vue from 'vue'
import wangEditor from 'wangeditor'
import AV from 'leancloud-storage'
import { WSAVERNOTSUPPORTED } from 'constants';

var APP_ID = 'DdJvmHiEBJj6F5kVAc3pDYsq-gzGzoHsz';
var APP_KEY = 'jj2nhqDz2n7A5A8lYmTIbHex';

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});


var app = new Vue({
    el:'#app',
    data:{
        logo:'Easy Memo',
        actionType:'signUp',
        formData:{
            username:'',
            password:''
        },
        visible:false,
        currentUser:false,
        showEditor:false,
        memoList:[
            {
                content:'<p>欢迎使用<span style="color: rgb(70, 172, 200); font-size: large;">Easy Memo !</span></p><p>easy memo是基于vue.js的便签应用</p><p>数据管理使用<a href="https://leancloud.cn/" target="_blank">leancloud</a></p><p>您可以在这里创建、管理您的便签。</p>',
                createdAt:''
            },
            {
                content:'<p>可以通过调节字体大小来区分<span style=\"font-size: x-large;\">标题</span>与内容&nbsp;&nbsp;<br></p><p>使用表情🙄让便签内容更加丰富</p><p>更改<span style=\"color: rgb(249, 150, 59);\">颜色</span>来标记某处文本</p><p>插入<a href=\"#\" target=\"_blank\">链接</a>来记录您感兴趣的网页</p><p>当然还可以添加图片&nbsp;<br></p><p><span style=\"font-style: italic;\"><img src=\"https://s1.ax1x.com/2018/04/02/CSpm7R.png\" style=\"max-width:100%;\"><br></span></p><p><span style=\"font-style: italic;\">祝您使用愉快！</span></p>',
                createdAt:''
            },
            {
                content:'使用前请先注册或登录',
                createdAt:''
            }
        ],
        editor:'',
        modifyIndex:'',
    },
        
    created(){
        this.currentUser=this.getCurrentUser()
        this.fatchMemos()
    },
    mounted(){
        this.editor = new wangEditor('.wangEditor')
        this.editor.customConfig.menus = [
        'bold',  // 粗体
        'fontSize',  // 字号
        'italic',  // 斜体
        'strikeThrough',  // 删除线
        'foreColor',  // 文字颜色
        'link',  // 插入链接
        'emoticon',  // 表情
        'image',  // 插入图片
        ]
        this.editor.create()
    },
    methods:{
        fatchMemos:function(){
            if(this.currentUser){
                var query=new AV.Query('AllMemos')
                query.find().then(
                    (memos)=>{
                        let avAllMemos = memos[0]
                        let id = avAllMemos.id
                        this.memoList = JSON.parse(avAllMemos.attributes.data)
                        this.memoList.id = id
                    },(error)=>{
                        console.error(error)
                    }
                )
            }
        },
        upload(){
            let dataString=JSON.stringify(this.memoList)
            let timeString = JSON.stringify(this.createdAt)
            if(this.memoList.id){
                var avMemos = AV.Object.createWithoutData('AllMemos',this.memoList.id)
                avMemos.set('data',dataString)
                avMemos.set('time',timeString)
                avMemos.save().then(
                    (memos)=>{

                    },(error)=>{
                        console.error(error)
                    }
                )
            }else{
                var AVMemos = AV.Object.extend('AllMemos')
                var avMemos = new AVMemos()
                var acl = new AV.ACL()
                acl.setReadAccess(AV.User.current(),true)
                acl.setWriteAccess(AV.User.current(),true)
                avMemos.set('data',dataString)
                avMemos.set('time',timeString)
                avMemos.setACL(acl)
                avMemos.save().then(
                    (memos)=>{
                        this.memoList.id = memos.id
                    }
                )
            }

        },
        close(){
            this.visible = false;
            this.formData.username = ''
            this.formData.password = ''
        },
        signUp(){
            if(!(this.formData.username&&this.formData.password)){
                alert("请正确输入用户名及密码")
                return
            }
            let user = new AV.User();
            console.log(this.formData)
            user.setUsername(this.formData.username)
            user.setPassword(this.formData.password)
            user.signUp().then(
                (loginedUser)=>{
                    this.visible = false
                    alert("注册成功")
                    this.login()
                },function(error){
                    console.error(error)
                }
            )
        },
        login(){
            if(!(this.formData.username&&this.formData.password)){
                alert("请正确输入用户名及密码")
                return
            }
            AV.User.logIn(this.formData.username,this.formData.password).then(
                (loginedUser)=>{
                    this.visible = false
                    this.currentUser=this.getCurrentUser()
                    this.fatchMemos()
                }
            )
        },
        logOut(){
            AV.User.logOut()
            this.currentUser = null
            window.location.reload()
        },
        getCurrentUser(){
            let current = AV.User.current()
            if(current){
                let {id,createdAt,attributes:{username}} = current
                return {id,username,createdAt}
            }else{
                return null
            }
        },
        saveMemo(){
            let time = new Date()
            if(!this.currentUser){
                alert("请先登录或者注册")
                return
            }
            var content = {
                content:this.editor.txt.html(),
                createdAt:this.getTime()
            }
            var txtCon = this.editor.txt.text();
            let testReg = /[^(&nbsp;|\s)]/
            if(!testReg.test(txtCon)){
                alert("请输入内容")
                return
            }
            if(typeof(this.modifyIndex) === "number"){
                this.memoList.splice(this.modifyIndex,1,content)
                this.modifyIndex = ''
            }else{
                this.memoList.push(content)
                var len = this.memoList.length - 1
            }

            this.showEditor = false
            this.editor.txt.clear()
            this.upload()
        },
        cansel(){
            this.showEditor = false
            this.editor.txt.clear()
        },
        deleteMemo(e){
            if(!this.currentUser){
                alert("请先登录或者注册")
                return
            }
            var remove = confirm("确定要删除吗？此操作不可撤销")
            if(remove){
                let index = this.memoList.indexOf(e)
                this.memoList.splice(index,1)
                this.upload()
            }
        },
        setTop(e){
            if(!this.currentUser){
                alert("请先登录或者注册")
                return
            }
            let index = this.memoList.indexOf(e)
            this.memoList.unshift(e)
            this.memoList.splice(index+1,1)
        },
        modify(e){
            if(!this.currentUser){
                alert("请先登录或者注册")
                return
            }
            this.modifyIndex = this.memoList.indexOf(e)
            this.showEditor = true
            this.editor.txt.html(e.content)
        },
        showCreatedAt(e){
            var nodes = [].slice.call(e.path[1].parentNode.children)
            let index = nodes.indexOf(e.path[1])
            if(e.target.title){
                return
            }
            e.target.title = this.memoList[index].createdAt
        },
        getTime(){
            let t = new Date();
            let month = t.getMonth()+1
            let date = t.getDate()
            let hour = t.getHours()
            let minutes = t.getMinutes()
            if(minutes<10){
                return '创建于'+month+'月'+date+'日'+''+hour+":"+'0'+minutes
            }else{
                return '创建于'+month+'月'+date+'日'+''+hour+":"+minutes
            }
        }
    }
})