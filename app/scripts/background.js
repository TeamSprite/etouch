
// browser.runtime.onInstalled.addListener(details => {
//   console.log("previousVersion", details.previousVersion);
// });

// browser.tabs.onUpdated.addListener(async tabId => {
//   browser.pageAction.show(tabId);
// });



const storage = {
  set: function(obj, callback) {
    chrome.storage.sync.set(obj, callback);
  },
  get: function(arr, callback) {
    chrome.storage.sync.get(arr, function(result) {
      callback(result);
    });
  }
};

storage.get(["firstOpen"], function(result) {
  if (!result.firstOpen) {
    storage.set(
      { urlList: [
        {
          key:'a',
          list:[
            // {id:0, label: "oa", url: "http://oa.vemic.com/home/index/index" },
            // {id:1, label: "ued", url: "http://ued.vemic.com" },
            // {id:2, label: "jira", url: "http://jira.vemic.com/secure/Dashboard.jspa" },
            // {id:3, label: "react debugger", url: "http://localhost:8081/debugger-ui" },
            {id:0, label: "百度", url: "http://wwww.baidu.com" }
          ]
        },
        {
          key:'b',
          list:[{id:0, label: "百度", url: "http://wwww.baidu.com" }]
        },
        {
          key:'c',
          list:[{id:0, label: "百度", url: "http://wwww.baidu.com" }]
        }
      ],firstOpen:true },
      function() {
        console.log('set')
      }
    );
  }
});



chrome.commands.onCommand.addListener(function(command) {
  console.log('command',command)
  let key = '';
  switch (command){
    case 'toggle-a':
      key = 'a'
      break;
    case 'toggle-b':
      key = 'b';
      break;
    case 'toggle-c':
      key = 'c';
      break;
    default:
      key = 'a';
  }
  storage.get(['urlList'],function(res){
    let  urlList= res.urlList||[];
    urlList.forEach((list)=>{
      if(list.key == key){
        list.list.forEach((item,idx)=>{
          chrome.tabs.create({ url: item.url, selected: !idx });
        })
        return
      }
    })
  })
});

chrome.commands.getAll(function(str){
  console.log('str',str)
})