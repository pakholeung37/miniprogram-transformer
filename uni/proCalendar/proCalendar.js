Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    isOpenAmount: {
      type: Boolean,
      value: false
    },
    price: {
      type: String,
      value: ""
    },
    amount: {
      type: String,
      value: ""
    },
    timeMapData: {
      type: Object,
      value: null
    },
    currencyVal: {
      type: String,
      value: ""
    },
    multiSelect: {
      type: Boolean,
      value: false
    }
  },
  observers: {
    "isOpenAmount, price, amount, timeMapData, currencyVal": function () {
      this.clearData();
      this.init();
    }
  },
  data: {
    selectYear: "",
    selectMonth: "",
    selectDate: "",
    currentYear: "",
    currentMonth: "",
    nowYear: "",
    nowMonth: "",
    dateArr: [],
    selectStart: {
      year: "",
      month: "",
      date: ""
    },
    selectEnd: {
      year: "",
      month: "",
      date: ""
    },
    cache: {}
  },
  methods: {
    init() {
      const now = new Date();
      const currentYear = this.data.currentYear || now.getFullYear();
      const currentMonth = this.data.currentMonth || now.getMonth() + 1;
      const nowYear = now.getFullYear();
      const nowMonth = now.getMonth() + 1;
      const dateArr = this.getDateArrByYearAndMonth(currentYear, currentMonth);
      this.setData({
        currentYear,
        currentMonth,
        nowYear,
        nowMonth,
        dateArr
      });
    },

    clearData() {
      //取消选择
      const selectYear = "";
      const selectMonth = "";
      const selectDate = "";
      const selectStart = {
        year: "",
        month: "",
        date: ""
      };
      const selectEnd = {
        year: "",
        month: "",
        date: ""
      };
      this.setData({
        selectYear,
        selectMonth,
        selectDate,
        selectStart,
        selectEnd
      });
    },

    getDateArrByYearAndMonth(year, month) {
      // 如果已经有cache, 那就从cache中返回, 不再重新计算
      if (this.data.cache[`${year}-${month}`]) {
        return this.data.cache[`${year}-${month}`];
      }

      const DATE_YEAR = new Date().getFullYear();
      const DATE_MONTH = new Date().getMonth() + 1;
      const DATE_DAY = new Date().getDate();
      month -= 1; //全部时间的月份都是按0~11基准，显示月份才+1

      const dateArr = []; //需要遍历的日历数组数据

      let nextYear = 0; //没有+1方便后面计算当月总天数

      let nextMonth = month + 1; //目标月1号对应的星期

      let startWeek = getWeek(year, nextMonth, 1); //获取目标月有多少天

      let dayNums = getTotalDayByMonth(year, nextMonth);

      if (month + 1 > 11) {
        nextYear = year + 1;
        dayNums = new Date(nextYear, nextMonth, 0).getDate();
      }

      for (let j = -startWeek + 1; j <= dayNums; j++) {
        let tempWeek = -1;

        if (j > 0) {
          tempWeek = getWeek(year, nextMonth, j);
        }

        let disabled = false;
        let isOutDate = false;

        if (j < DATE_DAY && year == DATE_YEAR && month + 1 == DATE_MONTH || month + 1 < DATE_MONTH && year == DATE_YEAR || year < DATE_YEAR) {
          //当天之前的日期不可用
          disabled = true;
          isOutDate = true;
        }

        let price, amount;

        if (!disabled) {
          price = this.data.price;
          amount = this.data.amount;
        }

        dateArr.push({
          dateNum: j,
          disabled: disabled,
          isOutDate: isOutDate,
          price: price,
          amount: amount
        });
      }

      if (this.data.timeMapData) {
        for (var i = 0; i < dateArr.length; i++) {
          var item = dateArr[i];

          if (item.dateNum <= 0) {
            continue;
          }

          var currentDate = new Date(year, month, item.dateNum);
          var currentDateStr = dateFormat("yyyy-MM-dd", currentDate);
          var targetObj = this.data.timeMapData[currentDateStr];

          if (targetObj) {
            if (item.isOutDate) {
              item.price = "";
              item.amount = "";
            } else {
              item.price = targetObj.price;
              item.amount = targetObj.amount;

              if (targetObj.amount === 0 && this.data.isOpenAmount) {
                item.disabled = true;
              }
            }
          } else {
            item.disabled = true;
            item.price = "";
            item.amount = "";
          }
        }
      }

      return dateArr;
    },

    handleClickDate(e) {
      const dataset = e.currentTarget.dataset || {};
      const dateNum = dataset.date || 0;
      const disabled = dataset.disabled || 0; // 选择不可选择单元或置灰单元, 不做任何操作

      if (dateNum <= 0 || disabled) {
        return;
      } // 单选日期 


      if (!this.data.multiSelect) {
        let currentYear = this.data.currentYear;
        let currentMonth = this.data.currentMonth;
        let selectYear = this.data.selectYear;
        let selectMonth = this.data.selectMonth;
        let selectDate = this.data.selectDate;
        let tmpDate = null;

        if (selectYear == currentYear && selectMonth == currentMonth && selectDate == dateNum) {
          //之前已经选中了这个日期，取消选择
          selectYear = "";
          selectMonth = "";
          selectDate = "";
        } else {
          //选中日期
          selectYear = currentYear;
          selectMonth = currentMonth;
          selectDate = dateNum;
          tmpDate = new Date(selectYear, selectMonth - 1, selectDate);
        }

        this.setData({
          selectYear,
          selectMonth,
          selectDate
        });
        let dateStr = null;

        if (tmpDate) {
          dateStr = dateFormat("yyyy-MM-dd", tmpDate);
        }

        this.triggerEvent("change", dateStr);
      } else {
        // 日期范围
        let selectStart = this.data.selectStart;
        let selectEnd = this.data.selectEnd;
        let selected = {
          year: this.data.currentYear,
          month: this.data.currentMonth,
          date: dateNum
        };
        /**
         * 当selectStart无值时, 直接赋值给selectStart, selectEnd赋空值
         * 
         * 当selectStart有值时, 此时selectStart为选中状态, 要进行以下逻辑判断
         * 1. 当selectEnd有值时, 此时重置selectStart为新选择值, 重置selectEnd为空值
         * 2. 当selectEnd无值, 并且新选值大于selectStart时, 将selectEnd赋值为新选值
         */

        console.log("click", selectEnd, selectStart, selected);

        if (!isADate(selectEnd) && isADate(selectStart) && greaterThan(selected, selectStart)
        /** 检查区间中是否有disabled */
        && !this.isDateRangeHasDisabled(selectStart, selected)) {
          selectEnd = selected;
        } else {
          selectStart = selected;
          selectEnd = {
            year: "",
            month: "",
            date: ""
          };
        }

        console.log(selectStart, selectEnd);
        this.triggerEvent("change", [selectStart, selectEnd]);
        this.setData({
          selectStart,
          selectEnd
        });
      }
    },

    toLastMonth() {
      const DATE_YEAR = new Date().getFullYear();
      const DATE_MONTH = new Date().getMonth() + 1;
      let currentYear = this.data.currentYear;
      let currentMonth = this.data.currentMonth;

      if (currentYear == DATE_YEAR && currentMonth == DATE_MONTH) {
        return;
      }

      const tmpDate = new Date(currentYear, currentMonth - 1);
      tmpDate.setMonth(tmpDate.getMonth() - 1);
      const nowDate = new Date(DATE_YEAR, DATE_MONTH - 1);

      if (tmpDate < nowDate) {
        this.setData({
          currentYear: DATE_YEAR,
          currentMonth: DATE_MONTH
        });
        return;
      }

      this.setData({
        currentYear: tmpDate.getFullYear(),
        currentMonth: tmpDate.getMonth() + 1
      });
      this.init();
    },

    toNextMonth() {
      const DATE_YEAR = new Date().getFullYear();
      const DATE_MONTH = new Date().getMonth() + 1;
      let currentYear = this.data.currentYear;
      let currentMonth = this.data.currentMonth;

      if (currentYear == DATE_YEAR + 1 && currentMonth == DATE_MONTH) {
        return;
      }

      let tmpDate = new Date(currentYear, currentMonth - 1);
      tmpDate.setMonth(tmpDate.getMonth() + 1);
      this.setData({
        currentYear: tmpDate.getFullYear(),
        currentMonth: tmpDate.getMonth() + 1
      });
      this.init();
    },

    isDateRangeHasDisabled(start, end) {
      if (!this.data.timeMapData) return false; // 直接穷举出所有选中日期

      const arr = [];
      const startTimeStamp = toDate(start).getTime();
      const endDateTimeStamp = toDate(end).getTime();

      for (let timeStamp = startTimeStamp; timeStamp <= endDateTimeStamp; timeStamp += 86_400_000) {
        arr.push(dateFormat("yyyy-MM-dd", new Date(timeStamp)));
      } // 判断日期是否在timeMapData中


      return !arr.every(date => this.data.timeMapData[date] !== undefined);
    }

  },
  lifetimes: {
    attached() {
      this.init();
    }

  }
});

function getTotalDayByMonth(year, month) {
  month = parseInt(month, 10);
  var d = new Date(year, month, 0);
  return d.getDate();
}

function getWeek(year, month, date) {
  var d = new Date(year, month - 1, date);
  return d.getDay();
}

function dateFormat(fmt, date) {
  var o = {
    "M+": date.getMonth() + 1,
    //月份
    "d+": date.getDate(),
    //日
    "h+": date.getHours(),
    //小时
    "m+": date.getMinutes(),
    //分
    "s+": date.getSeconds(),
    //秒
    "q+": Math.floor((date.getMonth() + 3) / 3),
    //季度
    "S": date.getMilliseconds() //毫秒

  };

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }

  return fmt;
}

function toDate({
  year,
  month,
  date
}) {
  return new Date(year, month - 1, date);
}

function isADate({
  year,
  month,
  date
}) {
  return year && month && date;
}

function greaterThan(date1, date2) {
  return toDate(date1).getTime() > toDate(date2).getTime();
}