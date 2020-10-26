const app = getApp();

var Fai = require("../../utils/util");

var {
  Components
} = require("../../components/components");

let COL_TYPE = 19;
let isShowLoading = true;
Page(Object.assign({}, Components, {
  data: {
    themeId: getApp().globalData.themeId || 1,
    moduleList: [],
    productSearchModule: {},
    productCategoryModule: {},
    categoryList: [],
    showCategoryListPanel: false,
    colType: COL_TYPE,
    pageContentHeight: 0,
    pageWidth: 0,
    selectIndex: 0,
    productCategoryModuleIndex: 0,
    menuFixed: false,
    isIpx: getApp().globalData.isIpx || false
  },
  onReady: function () {
    let that = this;
    wx.getSystemInfo({
      success: function (window) {
        let pageWidth = window.windowWidth;
        let pageHeight = Fai.pxToRpx(window.windowHeight, pageWidth);
        let pageContentHeight = 0;

        if (getApp().globalData.isModel) {
          pageContentHeight = pageHeight - 96; //不知道模板为什么固定底部高度96，这里没考虑单独访问的情况么。。。
        } else if (!that.data.isTabBarPath) {
          pageContentHeight = pageHeight; //如果底部导航不存在，那么需要铺满全屏
        } else if (getApp().globalData.isIpx) {
          pageContentHeight = pageHeight - 140; //iphoneX的情况下，底部高度是140rpx
        } else {
          pageContentHeight = pageHeight - 96; //android情况下，底部导航是96rpx
        }

        that.setData({
          pageContentHeight: pageContentHeight,
          pageWidth: pageWidth
        });
      }
    });
  },
  onLoad: function () {
    wx.removeStorageSync("mallStarToday");
    new getApp().InitData(this); // new getApp().FooterInit(this);

    new getApp().ProductCategoryInit(this);
    new getApp().PdFilterInit(this);
    Fai.setPageTitle(COL_TYPE);
    let that = this;

    that._editTabBar();

    if (that.data.dataCache != null) {
      let moduleList = that.data.dataCache;
      that.packagingPageData(moduleList);
      return;
    }

    Fai.request({
      url: "wxmallapp_h.jsp?cmd=getModuleDataFromCol",
      data: {
        colType: COL_TYPE
      },
      complete: function () {
        wx.hideLoading();
      },
      fail: () => {
        Fai.logMonitor(6307, true);
      },
      success: res => {
        let data = res.data || {};

        if (data.success) {
          let moduleList = data.moduleList || [];
          that.packagingPageData(moduleList);
        } else {
          Fai.logMonitor(6307, true);
        }
      }
    });
  },
  onShow: function () {
    getApp().ShowMallCartNum(this);
  },
  packagingPageData: function (moduleList) {
    let productSearchModule = {},
        productCategoryModuleIndex = 0,
        productCategoryModule = {};

    for (let i = 0; i < moduleList.length; i++) {
      let moduleData = moduleList[i];

      if (moduleData.style == 6) {
        moduleData.content.productList = this.sortProductList(moduleData.content.productList, moduleData.content.sn, moduleData.content.st);
      }
    }

    if (moduleList.length === 1) {
      productCategoryModule = moduleList[0] || {};
    } else {
      for (let i = 0; i < moduleList.length; i++) {
        if (moduleList[i].style === 6) {
          // 产品分类
          productCategoryModule = moduleList[i];
          productCategoryModuleIndex = i;
        } else {
          productSearchModule = moduleList[i];
        }
      }
    }

    if (!(Object.keys(productSearchModule).length === 0)) {
      this.setData({
        productSearchModule: productSearchModule,
        menuFixed: false
      });
    }

    let categoryList = [];

    if (productCategoryModule.content && Array.isArray(productCategoryModule.content.pcl)) {
      categoryList = productCategoryModule.content.pcl;
    }

    this.setData({
      moduleList: moduleList,
      productCategoryModuleIndex,
      productCategoryModuleIndex,
      productCategoryModule,
      productCategoryModule,
      categoryList: categoryList,
      dataCache: moduleList
    });
  },
  showPanel: function () {
    let tmpSelectIndex = this.data.moduleList[this.data.productCategoryModuleIndex].selectIndex;
    this.setData({
      showCategoryListPanel: true,
      selectIndex: tmpSelectIndex
    });

    if (Object.keys(this.data.productSearchModule).length === 0) {
      this.setData({
        menuFixed: true
      });
    }
  },
  tapToHidePanel: function () {
    this.setData({
      showCategoryListPanel: false
    });
  },
  selectCategory: function (event) {
    let groupId = event.currentTarget.dataset.groupid;
    let moduleIndex = event.currentTarget.dataset.moduleindex;
    let groupIndex = event.currentTarget.dataset.groupindex;

    if (groupIndex == this.data.selectIndex) {
      return;
    }

    this.onPclTabClick(event);
    this.setData({
      showCategoryListPanel: false,
      selectIndex: groupIndex
    });
  },
  toProductDetailPage: function (e) {
    let dataSet = e.currentTarget.dataset || {};
    let productInfo = dataSet.productinfo;
    Fai.toProductDetailPage(productInfo);
  },
  onPullDownRefresh: function () {
    let that = this;
    new getApp().InitData(this);
    new getApp().ProductCategoryInit(this);
    Fai.setPageTitle(COL_TYPE);
    wx.showLoading({
      title: '加载中'
    });
    Fai.request({
      url: "wxmallapp_h.jsp?cmd=getModuleDataFromCol",
      data: {
        colType: COL_TYPE
      },
      complete: function () {
        wx.hideLoading();
      },
      fail: () => {
        Fai.logMonitor(6307, true);
      },
      success: res => {
        let data = res.data || {};

        if (data.success) {
          let moduleList = data.moduleList || [];
          that.packagingPageData(moduleList);
          that.setData({
            "productGroupList": data.productGroupList
          });
          wx.stopPullDownRefresh();
        } else {
          Fai.logMonitor(6307, true);
        }
      }
    });
  },
  onPageScroll: function (e) {
    let menuFixed = false;

    if (e.scrollTop > 0) {
      if (Object.keys(this.data.productSearchModule).length > 0) {
        // 65是搜索模块的高度, 这里不使用createSelectorQuery以尽量减少动画效果的延迟
        if (this.data.menuFixed === e.scrollTop > 65) {
          return;
        }

        menuFixed = e.scrollTop > 65;
      } else {
        menuFixed = true;
      }
    } else {
      if (this.data.showCategoryListPanel) {
        return;
      }
    }

    this.setData({
      menuFixed: menuFixed
    });
  },
  sortProductList: function (productList, type, order) {
    if (productList.length < 2 || type == undefined) return productList;
    let topList = [],
        sortList = [];
    productList.forEach(function (item, index) {
      if (item.top > 0) {
        topList.push(item);
      } else {
        sortList.push(item);
      }
    });

    if (type == "name") {
      sortList = sortList.sort(function compareFunction(itemA, itemB) {
        let itemAName = itemA.name;
        let itemBName = itemB.name;
        let rt = 0;

        if (order == "asc") {
          rt = itemAName.localeCompare(itemBName);
        } else {
          rt = itemBName.localeCompare(itemAName);
        }

        if (rt != 0) {
          return rt;
        }

        if (order == "asc") {
          return itemA.addedTime - itemB.addedTime;
        } else {
          return itemB.addedTime - itemA.addedTime;
        }
      });
    } else {
      sortList = sortList.sort(function compareFunction(itemA, itemB) {
        let itemAValue = itemA[type];
        let itemBValue = itemB[type];
        let rt = 0;

        if (order == "asc") {
          rt = itemAValue - itemBValue;
        } else {
          rt = itemBValue - itemAValue;
        }

        if (rt != 0) {
          return rt;
        }

        if (order == "asc") {
          return itemA.addedTime - itemB.addedTime;
        } else {
          return itemB.addedTime - itemA.addedTime;
        }
      });
    }

    productList = topList.concat(sortList);
    return productList;
  }
}));