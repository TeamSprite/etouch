document.addEventListener("DOMContentLoaded", function() {
  let storageList;
  let tabIdx = 0;
  const KEY_ARR = ["a", "b", "c"];
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

  /**
   * @param idx: 当前 tab 索引;
   * @param list: 当前 tab 地址数组;
   * @description: 渲染单个tab页
   */
  const renderList = function(idx, list) {
    let $cardMain = $(`.J-card-main:eq(${idx})`);
    let temp = "";
    list.forEach(item => {
      let str = `
    <div class="J-urlItem urlItem" data-id=${item.id}>
      <p class="urlItem-operations">
        <button class="urlItem-modify J-urlItem-modify">修改</button>
        <button class="urlItem-delete J-urlItem-delete">删除</button>
      </p>
      <input type="text" class="input urlItem-input-label J-urlItem-input-label" placeholder="名称" 
        value = ${item.label.replace(" ", "&nbsp;") || " "}
      />
      <input type="text" class="input urlItem-input J-urlItem-input" placeholder="网址" value=${item.url ||
        " "}/>
    </div>
    `;
      temp += str;
    });
    $cardMain.empty();
    $cardMain.append(temp);
  };

  //渲染所有tab页
  const renderUrlList = () => {
    storage.get(["urlList"], res => {
      let urlList = res.urlList || [];
      console.log(urlList);
      storageList = res.urlList;
      urlList.forEach(item => {
        let list = item.list;
        let idx = KEY_ARR.indexOf(item.key);
        renderList(idx, list);
      });
    });
  };

  const initAddEvt = () => {
    $(".J-add").on({
      click: e => {
        let $li = $(e.target).closest("li");
        let $label = $li.find(".J-urlItem-input-label");
        let label = $label.val().trim();
        let $url = $li.find(".J-urlItem-input");
        let url = $url
          .val()
          .trim()
          .replace(/\/*$/, "");
        if ($url.val().length && label.length) {
          $(".J-hide").addClass("hide");
          let id = ~~(Math.random() * 1000000);
          let { key, list } = $.extend({}, storageList[tabIdx]);
          list.push({
            id,
            label,
            url
          });
          storageList.splice(tabIdx, 1, { key, list });
          console.log("addStorage", storageList);
          storage.set({ urlList: storageList }, () => {
            renderList(tabIdx, list);
            $label.val("");
            $url.val("");
          });
        } else {
          $(".J-hide").removeClass("hide");
        }
      }
    });
  };

  const initImportConfig = () => {
    $(".J-file").on("change", function(e) {
      const file = e.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = e => {
        let data = JSON.parse(e.target.result);
        let urlList=[];
        for (let key in data) {
          urlList.push({ ...data[key] });
        }
        storage.set(
          {
            urlList:urlList
          },
          () => {
            renderUrlList();
          }
        );
      };
    });
  };

  var downloadFile = function(content, filename) {
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
  };

  const initDownloadConf = ()=>{
    storage.get(["urlList"], res => {
      let urlList = res.urlList || [];
      try{
        $('.J-download-conf').on('click',()=>{
          downloadFile(JSON.stringify(urlList),'eTouch.conf.json')
        })
      }catch(err){
        console.log('download err:',err)
      }
    });
  }

  const initDeleteEvt = () => {
    //delete
    $(".J-card-main").on("click", ".J-urlItem-delete", e => {
      let $div = $(e.target).closest("div");
      let id = $div.attr("data-id");
      let { key, list } = storageList[tabIdx];
      list = list.filter(item => {
        return item.id != id;
      });

      storageList.splice(tabIdx, 1, { key, list });
      storage.set({ urlList: storageList }, function() {
        renderList(tabIdx, list);
      });
    });
  };

  const initModifyEvt = () => {
    //modify
    $(".J-card-main").on("click", ".J-urlItem-modify", e => {
      let $div = $(e.target).closest("div");
      let label = $div
        .find(".J-urlItem-input-label")
        .val()
        .trim();
      let url = $div
        .find(".J-urlItem-input")
        .val()
        .trim()
        .replace(/\/*$/, "");
      let id = $div.attr("data-id");
      let { key, list } = storageList[tabIdx];
      list = list.map(item => {
        if (item.id == id) {
          return {
            id,
            label,
            url
          };
        }
        return item;
      });
      storageList.splice(tabIdx, 1, { key, list });
      console.log("modify Storage", storageList);
      storage.set({ urlList: storageList }, function() {
        renderList(tabIdx, list);
      });
    });
  };

  const initRadio = () => {
    $("input[type=radio]").on("change", e => {
      tabIdx = $(e.target).val();
    });
  };

  const init = () => {
    initAddEvt();
    initDeleteEvt();
    initModifyEvt();
    initRadio();
    initImportConfig();
    initDownloadConf();
  };

  init();

  renderUrlList();
});
