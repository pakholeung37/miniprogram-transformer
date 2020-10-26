var Tab = {
  _handleTabChange(e) {
    var dataset = e.currentTarget.dataset;
    var componentId = dataset.componentId;
    var selectedId = dataset.itemId;
    var data = {
      componentId,
      selectedId
    };

    if (this.handleTabChange) {
      this.handleTabChange(data);
    } else {
      console.warn("页面缺少 handleTabChange 回调函数");
    }
  }

};
module.exports = Tab;