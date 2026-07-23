<script setup lang="ts">
import useClipboard from "vue-clipboard3";
import { onMounted, ref } from "vue";
import { DrawerProps, ElMessage } from "element-plus";
import axiosInstance from "../request";
const { toClipboard } = useClipboard();

const drawer = ref(false);
const direction = ref<DrawerProps["direction"]>("rtl");

const driverUser = ref<any[]>([]);
const keyword = ref("");
const usercode = ref("");
const paymentTime = ref("");
let date = new Date();
date.setHours(0, 0, 0, 0);
const placeAnOrderTime = ref([
  date.getTime() / 1000 - 3600 * 24 * 7,
  date.getTime() / 1000,
]);
const deliveryTime = ref("");
const selectedDriver = ref("");
const searchOrder = () => {
  currentPage.value = 1;
  getOrderList();
};

const activeStatus = ref("all");

const statustype = {
  all: "",
  fukuan: "0",
  fahuo: "201",
  peisong: "301",
  wancheng: "1",
  quxiao: "101",
} as any;
const StatushandleClick = (e: { props: { name: string } }) => {
  activeStatus.value = e.props.name;
  currentPage.value = 1;
  getOrderList();
};

const orderlistData = ref<any[]>([]);
const loading = ref(false);
const orderTotal = ref(0);
const getOrderList = async () => {
  let url = `https://api.xiaocan.com.cn/partner/api/orders?page=${currentPage.value}&limit=50`;
  if (placeAnOrderTime.value) {
    url += `&add_time_start=${placeAnOrderTime.value[0]}&add_time_end=${
      placeAnOrderTime.value[1] + 3600 * 24
    }`;
  }
  if (keyword.value) {
    url += `&keyword=${keyword.value}`;
  }
  if (paymentTime.value) {
    url += `&pay_time_start=${paymentTime.value[0]}&pay_time_end=${paymentTime.value[1]}`;
  }
  if (deliveryTime.value) {
    url += `&shipping_time_start=${deliveryTime.value[0]}&shipping_time_end=${deliveryTime.value[1]}`;
  }
  if (usercode.value) {
    url += `&user_id=${usercode.value}`;
  }

  if (selectedDriver.value) {
    url += `&delivery=${selectedDriver.value}`;
  }
  if (statustype[activeStatus.value] != "") {
    url += `&order_status=${statustype[activeStatus.value]}`;
    if (activeStatus.value === "fahuo") {
      url += `&shipping_status=-1`;
    }
  }

  loading.value = true;
  const res = await axiosInstance.post(
    "https://data.andupchain.com/api/Test/CommonApi",
    {
      url: url,
      header: {
        authentication: window.localStorage.getItem("cookiename"),
        "show-all-subject": "0",
        referer: "https://huoban.xiaocan.com.cn/",
      },
      type: "1",
    },
  );
  orderlistData.value = JSON.parse(res.data.data).data.orders.filter(
    (item: any) => {
      return item.address.indexOf("上饶") > -1;
    },
  );
  loading.value = false;
  orderTotal.value = JSON.parse(res.data.data).data.total;
};

const currentPage = ref(1);

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  getOrderList();
};

const statusTagTypelist = ref([
  "已付款",
  "已完成",
  "已取消",
  "配货中",
  "配送中",
  "success",
  "primary",
  "danger",
  "warning",
  "primary",
]);

function getWeek(dateTime: Date): number {
  let temptTime = new Date(dateTime.getTime());
  // 周几
  let weekday = temptTime.getDay() || 7;
  // 周1+5天=周六
  temptTime.setDate(temptTime.getDate() - weekday + 1 + 5);
  let firstDay = new Date(temptTime.getFullYear(), 0, 1);
  let dayOfWeek = firstDay.getDay();
  let spendDay = 1;
  if (dayOfWeek != 0) spendDay = 7 - dayOfWeek + 1;
  firstDay = new Date(temptTime.getFullYear(), 0, 1 + spendDay);
  let d = Math.ceil((temptTime.valueOf() - firstDay.valueOf()) / 86400000);
  let result = Math.ceil(d / 7);
  return result;
}

const formatDate = (date: Date, format: string): string => {
  let we = date.getDay(); // 星期
  let z = getWeek(date); // 周
  let qut = Math.floor((date.getMonth() + 3) / 3).toString(); // 季度
  const opt: { [key: string]: string } = {
    "Y+": date.getFullYear().toString(), // 年
    "m+": (date.getMonth() + 1).toString(), // 月(月份从0开始，要+1)
    "d+": date.getDate().toString(), // 日
    "H+": date.getHours().toString(), // 时
    "M+": date.getMinutes().toString(), // 分
    "S+": date.getSeconds().toString(), // 秒
    "q+": qut, // 季度
  };
  // 中文数字 (星期)
  const week: { [key: string]: string } = {
    "0": "日",
    "1": "一",
    "2": "二",
    "3": "三",
    "4": "四",
    "5": "五",
    "6": "六",
  };
  // 中文数字（季度）
  const quarter: { [key: string]: string } = {
    "1": "一",
    "2": "二",
    "3": "三",
    "4": "四",
  };
  if (/(W+)/.test(format))
    format = format.replace(
      RegExp.$1,
      RegExp.$1.length > 1
        ? RegExp.$1.length > 2
          ? "星期" + week[we]
          : "周" + week[we]
        : week[we],
    );
  if (/(Q+)/.test(format))
    format = format.replace(
      RegExp.$1,
      RegExp.$1.length == 4 ? "第" + quarter[qut] + "季度" : quarter[qut],
    );
  if (/(Z+)/.test(format))
    format = format.replace(
      RegExp.$1,
      RegExp.$1.length == 3 ? "第" + z + "周" : z + "",
    );
  for (let k in opt) {
    let r = new RegExp("(" + k + ")").exec(format);
    // 若输入的长度不为1，则前面补零
    if (r)
      format = format.replace(
        r[1],
        RegExp.$1.length == 1 ? opt[k] : opt[k].padStart(RegExp.$1.length, "0"),
      );
  }
  return format;
};

const drawerTitle = ref("");

const orderDetailData = ref<any>({});
const orderServices = ref<any>([]);
const deliveries = ref<any>([]);
const orderDetail = (row: any) => {
  axiosInstance
    .post("https://data.andupchain.com/api/Test/CommonApi", {
      url: `https://api.xiaocan.com.cn/partner/api/orders/detail?orderId=${row.id}`,
      
      header: {
        authentication: window.localStorage.getItem("cookiename"),
        "show-all-subject": "0",
        referer: "https://huoban.xiaocan.com.cn/",
      },
      type: "1",
    })
    .then((res) => {
      const resdata = JSON.parse(res.data.data);
      orderDetailData.value = resdata.data;
      drawer.value = true;
      drawerTitle.value = `订单详情「${resdata.data.orderInfo.depots.name}」${
        resdata.data.orderInfo.today_confirm_id
          ? `#${resdata.data.orderInfo.today_confirm_id}`
          : ""
      }`;
      if (orderDetailData.value.orderInfo.order_sn) {
        axiosInstance
          .post("https://data.andupchain.com/api/Test/CommonApi", {
            url: `https://api.xiaocan.com.cn/partner/api/orders/deliveries?order_sn=${orderDetailData.value.orderInfo.order_sn}`,
            
      header: {
        authentication: window.localStorage.getItem("cookiename"),
        "show-all-subject": "0",
        referer: "https://huoban.xiaocan.com.cn/",
      },
            type: "1",
          })
          .then((response) => {
            deliveries.value = JSON.parse(response.data.data).data.deliveries;
          });
      }
    });
  axiosInstance
    .post("https://data.andupchain.com/api/Test/CommonApi", {
      url: `https://api.xiaocan.com.cn/partner/api/services?order_id=${row.id}&page=1&limit=999`,
      
      header: {
        authentication: window.localStorage.getItem("cookiename"),
        "show-all-subject": "0",
        referer: "https://huoban.xiaocan.com.cn/",
      },
      type: "1",
    })
    .then((res) => {
      orderServices.value = JSON.parse(res.data.data).data.rows;
    });
};

const getdriverUser = async () => {
  const res = await axiosInstance.post(
    "https://data.andupchain.com/api/Test/CommonApi",
    {
      url: `https://api.xiaocan.com.cn/partner/api/driver/userInfo`,
      
      header: {
        authentication: window.localStorage.getItem("cookiename"),
        "show-all-subject": "0",
        referer: "https://huoban.xiaocan.com.cn/",
      },
      type: "1",
    },
  );
  driverUser.value = JSON.parse(res.data.data).data;
};

const copyText = (text: string, message: string) => {
  return new Promise((resolve, reject) => {
    try {
      //复制
      toClipboard(text);
      //下面可以设置复制成功的提示框等操作
      ElMessage.success(message);
      resolve(text);
    } catch (e) {
      //复制失败
      ElMessage.error("复制失败");
      reject(e);
    }
  });
};

const isPhone = ref(false);

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}
onMounted(() => {
  isPhone.value = isMobile();
  getOrderList();
  getdriverUser();
});
</script>

<template>
  <div class="content">
    <div class="search">
      <el-input
        v-model="keyword"
        style="max-width: 300px; margin-right: 10px; margin-bottom: 10px"
        placeholder="支持收货人/手机号/订单编号"
        clearable
      >
      </el-input>
      <el-input
        v-model="usercode"
        style="max-width: 300px; margin-right: 10px; margin-bottom: 10px"
        placeholder="用户编码"
        clearable
      >
      </el-input>
      <el-date-picker
        v-model="paymentTime"
        type="daterange"
        range-separator="To"
        value-format="X"
        style="max-width: 300px; margin-right: 10px; margin-bottom: 10px"
        start-placeholder="支付时间"
        end-placeholder="结束时间"
        size="default"
      />
      <el-date-picker
        v-model="placeAnOrderTime"
        type="daterange"
        style="max-width: 300px; margin-right: 10px; margin-bottom: 10px"
        range-separator="To"
        start-placeholder="下单时间"
        end-placeholder="结束时间"
        value-format="X"
        size="default"
      />
      <el-date-picker
        v-model="deliveryTime"
        type="daterange"
        value-format="X"
        style="max-width: 300px; margin-right: 10px; margin-bottom: 10px"
        range-separator="To"
        start-placeholder="送达开始时间"
        end-placeholder="送达结束时间"
        size="default"
      />
      <!-- <el-select
				v-model="selectedDriver"
				value-key=""
				placeholder=""
				style="max-width: 300px; margin-right: 10px"
				clearable
				filterable
			>
				<el-option
					v-for="item in driverUser"
					:key="item.id"
					:label="item.username"
					:value="item.userid"
				>
				</el-option>
			</el-select> -->
      <el-button type="primary" @click="searchOrder">搜索</el-button>
    </div>
    <div style="padding: 0 10px">
      <el-tabs
        v-model="activeStatus"
        class="demo-tabs"
        @tab-click="StatushandleClick"
      >
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="待付款" name="fukuan"></el-tab-pane>
        <el-tab-pane label="待发货" name="fahuo"></el-tab-pane>
        <el-tab-pane label="正在配送" name="peisong"></el-tab-pane>
        <el-tab-pane label="已完成" name="wancheng"></el-tab-pane>
        <el-tab-pane label="已取消" name="quxiao"></el-tab-pane>
      </el-tabs>
    </div>
    <div class="orderBox">
      <el-table
        :data="orderlistData"
        style="width: 100%"
        border
        :show-header="false"
        v-loading="loading"
        @row-click="orderDetail"
      >
        <el-table-column min-width="230">
          <template #default="scope">
            <div class="orderInfo">
              <p>
                <b>{{ scope.row.consignee }}</b>
                {{ scope.row.mobile }}
              </p>
              <p>
                {{ scope.row.address }}
              </p>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="150">
          <template #default="scope">
            <div class="prciece">
              总价￥{{ scope.row.actual_price }}<br />
              <span v-if="Number(scope.row.coupon_price) > 0"
                >优惠￥{{ scope.row.coupon_price }}</span
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column width="200">
          <template #default="scope">
            <div class="status">
              <el-tag
                :type="
                  statusTagTypelist[
                    statusTagTypelist.indexOf(scope.row.statusText) + 5
                  ]
                "
                size="default"
                effect="dark"
                style="margin-right: 10px"
                >{{ scope.row.statusText }}</el-tag
              >
              <el-tag
                type="info"
                size="default"
                effect="dark"
                v-if="scope.row.today_confirm_id"
                >{{ scope.row.today_confirm_id }}</el-tag
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="200">
          <template #default="scope">
            <div class="time">
              <p>
                支付：
                {{
                  scope.row.pay_status
                    ? formatDate(
                        new Date(scope.row.pay_time * 1000),
                        "mm-dd HH:MM:SS",
                      )
                    : "未支付"
                }}
              </p>
              <p>
                配送：
                {{ formatDate(new Date(scope.row.delivery_day), "mm-dd") }}
                {{ scope.row.delivery_time }}
              </p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="50"
        :background="true"
        layout="prev, pager, next"
        :total="orderTotal"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <el-drawer
    v-model="drawer"
    :direction="direction"
    :size="isPhone ? '100%' : '700px'"
  >
    <template #header>
      <span style="text-align: left; margin: 0px; font-weight: 700">{{
        drawerTitle
      }}</span>
    </template>
    <div class="allpromotion">
      <div class="wuliu" v-if="orderDetailData?.orderInfo?.confirm_time">
        <el-steps
          class="mb-4"
          style="
            max-width: 100%;
            width: 100%;
            display: flex;
            flex-direction: row;
            padding: 0px;
          "
          :active="3"
          finish-status="success"
          simple
        >
          <el-step style="margin-right: 0px; flex: 1 1 0%">
            <template #title>
              <div style="font-size: 14px; color: #000">系统 - 确认订单</div>
              <div style="font-size: 12px; color: #000">
                {{
                  formatDate(
                    new Date(orderDetailData?.orderInfo?.confirm_time * 1000),
                    "YYYY-mm-dd HH:MM:SS",
                  )
                }}
              </div>
            </template>
          </el-step>
          <el-step title="Step 2" style="margin-right: 0px; flex: 1 1 0%">
            <template #title>
              <div style="font-size: 14px; color: #000">
                {{ deliveries[0]?.username }} - 开始配送
              </div>
              <div style="font-size: 12px; color: #000">
                {{ deliveries[0]?.updatedAt }}
              </div>
            </template>
          </el-step>
          <el-step title="Step 3" style="margin-right: 0px; flex: 1 1 0%">
            <template #title>
              <div style="font-size: 14px; color: #000">
                {{ deliveries[1]?.username }} - 完成配送
              </div>
              <div style="font-size: 12px; color: #000">
                {{ deliveries[1]?.updatedAt }}
              </div>
            </template>
          </el-step>
        </el-steps>
      </div>
      <div class="address">
        <div>
          <span>{{ orderDetailData?.orderInfo?.consignee }}</span
          >|<el-link
            target="_blank"
            @click="
              copyText(orderDetailData?.orderInfo?.mobile, '用户手机号复制成功')
            "
            >{{ orderDetailData?.orderInfo?.mobile }}</el-link
          >
        </div>
        <div>{{ orderDetailData?.orderInfo?.address }}</div>
      </div>
      <div class="orderBox">
        <div class="orderInfo">
          <p>
            订单状态：{{ orderDetailData?.orderInfo?.order_status_text }}
            <span v-if="orderDetailData?.orderInfo?.pay_status == 0"
              >/未付款</span
            ><span v-if="orderDetailData?.orderInfo?.confirmer == 0"
              >/未确认</span
            >
          </p>
          <p>
            客户来源：{{
              orderDetailData?.orderInfo?.bizUser
                ? orderDetailData?.orderInfo?.bizUser.name
                : orderDetailData?.orderInfo?.biz
            }}
          </p>
          <p>
            配送司机：{{ orderDetailData?.orderInfo?.driver?.name }}/{{
              orderDetailData?.orderInfo?.driver?.mobile
            }}
          </p>
          <p>
            配送时间：{{ orderDetailData?.orderInfo?.delivery_day }}
            {{ orderDetailData?.orderInfo?.delivery_time }}
          </p>
          <p>
            配送费用：{{
              $currency(orderDetailData?.orderInfo?.freight_price).format()
            }}
          </p>
          <p>
            订单优惠：{{
              $currency(orderDetailData?.orderInfo?.goods_original_price)
                .subtract(orderDetailData?.orderInfo?.actual_price)
                .format()
            }}
          </p>
          <p>
            实际支付：{{
              $currency(orderDetailData?.orderInfo?.actual_price).format()
            }}
          </p>
          <p>
            备注：{{
              orderDetailData?.orderInfo?.order_remark
                ? orderDetailData?.orderInfo?.order_remark
                : ""
            }}
          </p>
        </div>
        <div class="orderInfo">
          <p>
            订单编号：
            <el-link
              type="primary"
              @click="
                copyText(
                  orderDetailData?.orderInfo?.order_sn,
                  '订单编号复制成功',
                )
              "
              >{{ orderDetailData?.orderInfo?.order_sn }}</el-link
            >
          </p>
          <p>
            用户编号：
            <el-link
              type="primary"
              @click="
                copyText(
                  orderDetailData?.orderInfo?.user_id,
                  '用户编号复制成功',
                )
              "
              >{{ orderDetailData?.orderInfo?.user_id }}</el-link
            >
          </p>
          <p>
            下单时间：{{
              formatDate(
                new Date(orderDetailData?.orderInfo?.add_time * 1000),
                "YYYY-mm-dd HH:MM:SS",
              )
            }}
          </p>
          <p v-if="orderDetailData?.orderInfo?.confirm_time">
            确认时间：{{
              formatDate(
                new Date(orderDetailData?.orderInfo?.confirm_time * 1000),
                "YYYY-mm-dd HH:MM:SS",
              )
            }}
          </p>
          <p v-if="orderDetailData?.orderInfo?.pay_time">
            支付时间：{{
              formatDate(
                new Date(orderDetailData?.orderInfo?.pay_time * 1000),
                "YYYY-mm-dd HH:MM:SS",
              )
            }}
          </p>
          <p v-if="orderDetailData?.orderInfo?.pay_id">
            支付单号：{{ orderDetailData?.orderInfo?.pay_id }}
          </p>
        </div>
      </div>
      <div class="orderCommodity">
        <el-table
          :data="orderDetailData?.orderGoods"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column prop="goods_name" label="商品名称">
          </el-table-column>
          <el-table-column prop="number" label="数量" width="70">
          </el-table-column>
          <el-table-column
            prop="specification_name"
            label="规格"
            min-width="70"
          >
          </el-table-column>

          <el-table-column prop="goods_price" label="单价" width="90">
            <template #default="scope">
              {{ $currency(scope.row.retail_price).format() }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="totalPrices">
        商品总额：{{
          $currency(orderDetailData?.orderInfo?.goods_original_price).format()
        }}
      </div>
      <el-divider content-position="left" style="margin-bottom: 10px"
        >售后记录</el-divider
      >
      <el-table
        :data="orderServices"
        border
        stripe
        empty-text="还没有售后订单"
        style="margin-bottom: 10px"
        :show-header="false"
      >
        <el-table-column
          prop="goods_name"
          label="商品名称"
          :width="isPhone ? 100 : 230"
        >
          <template #default="scope">
            <div class="serviceInfo">
              <p class="textinfo">
                {{ scope.row.typeName }}|{{ scope.row.statusText }}
              </p>
              <p class="textinfo">单号：{{ scope.row.service_sn }}</p>
              <p class="textinfo">提交：{{ scope.row.createdAt }}</p>
              <p class="textinfo">更新：{{ scope.row.updatedAt }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="goods_name" label="商品名称">
          <template #default="scope">
            <div class="serviceInfo">
              <p class="textinfo">售后原因：{{ scope.row.reason }}</p>
              <div class="service__goodbox">
                <template v-for="item in scope.row.order_goods" :key="item">
                  <div class="service__gooditem">
                    <div class="gooditem__image">
                      <img :src="item.list_pic_url" />
                    </div>
                    <div class="gooditem__name">
                      <a
                        class="el-link el-link--default is-underline"
                        style="margin-right: 5px"
                        ><!----><span class="el-link--inner">
                          {{ item.service_goods_name }}</span
                        ><!----></a
                      >
                      <div class="gooditem__spec">
                        <span style="color: rgb(245, 154, 35)">{{
                          $currency(item.retail_price).format()
                        }}</span
                        ><span style="padding: 0px 6px">/</span
                        ><span
                          >{{ item.service_specification_name }} x
                          {{ item.service_number }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <div
                    style="margin-left: 6px; margin-top: -6px"
                    v-if="item.chaomaGoods.length"
                  >
                    <div class="service__item">
                      实际抄码：
                      <span
                        class="chaoma__item"
                        v-for="it in item.chaomaGoods"
                        :key="it.id"
                      >
                        {{ it.basic_unit_number }}kg
                      </span>
                    </div>
                    <div class="mt5" style="color: black">
                      退款重量：<span class="money__color"
                        >{{ item.service_basic_unit_number }}kg</span
                      ><span>&nbsp;/&nbsp;</span> 退款金额：<span
                        class="money__color"
                        >{{ $currency(item.retail_price).format() }}</span
                      >
                    </div>
                  </div>
                </template>
                <div style="padding-left: 6px">
                  <span style="color: red"
                    >应退金额：{{
                      $currency(scope.row.refund_price).format()
                    }}</span
                  ><!---->
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-divider content-position="left" style="margin-bottom: 10px"
        >丢货记录</el-divider
      >
      <el-table
        :data="orderDetailData?.afterSale"
        border
        stripe
        empty-text="暂无丢货记录"
        style="margin-bottom: 10px"
      >
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
      </el-table>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.content {
  width: 100%;
  height: 100%;
  background-color: #f3f4f7;
  padding: 10px;

  .search {
    padding: 10px;
    background-color: #fff;
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .orderBox {
    padding: 10px;
    background-color: #fff;
    border-radius: 5px;
    .orderInfo {
      p {
        margin: 0px;
        line-height: 1.5em;
      }
    }
    .prciece {
      text-align: left;
    }
    .status {
      text-align: center;
    }
    .time {
      p {
        margin: 0px;
        line-height: 1.5em;
      }
    }
  }

  .pagination {
    text-align: center;
    margin-top: 10px;
    background-color: #fff;
    padding: 10px;
    display: flex;
    justify-content: flex-end;
  }
}

// ::v-deep .el-table .el-table__body tr.el-table__row:hover {
//   background-color: #f8e219 ; /* 你想要的 hover 颜色 */
// }
:deep(.orderBox .el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #f8e219 !important;
}
.allpromotion {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  .wuliu {
    padding: 12px 6px;
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;
    border-radius: 4px;
    background: #f5f7fa;
    width: 100%;
  }
  .address {
    padding: 10px;
    background: #f5f7fa;
    width: 100%;
    text-align: left;
    color: #606060;
    font-size: 14px;
    margin-bottom: 15px;
  }
  .orderBox {
    display: flex;
    flex-direction: row;
    background: #f5f7fa;
    width: 100%;
    margin-bottom: 10px;
    .orderInfo {
      border: 1px solid #eceef4;
      padding: 10px;
      color: #606060;
      font-size: 14px;
      background: #fafafa;
      text-align: left;
      width: 50%;
      p {
        word-break: break-all;
        margin: 0px 0px 5px 0px;
      }
    }
  }
  .orderCommodity {
    width: 100%;
    margin-bottom: 10px;
  }
  .totalPrices {
    text-align: right;
    width: 100%;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 10px;
    line-height: 1.5rem;
  }
  .serviceInfo {
    .textinfo {
      margin: 0px;
      word-break: break-all;
      line-height: 1.5em;
    }

    .service__goodbox {
      border: 1px solid #ebeef5;
      border-radius: 5px;
      padding: 6px;
      margin-bottom: 6px;
    }

    .service__goodbox .service__goodbox {
      background: #f1f1f1;
      margin-left: 24px;
    }

    .service__goodbox .service__goodbox .service__gooditem {
      margin-bottom: 0;
    }

    .service__goodbox .service__gooditem {
      border: none;
      padding: 0;
      margin: 6px 6px 12px;
      border-radius: 0;
    }

    .gooditem__image {
      width: 50px;
      height: 50px;
      border-radius: 5px;
      border: 1px solid #ebeef5;
      padding: 6px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      margin-right: 6px;
      background: #fff;
    }

    .gooditem__image img {
      width: 100%;
      height: 100%;
    }

    .service__gooditem {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: horizontal;
      -webkit-box-direction: normal;
      -ms-flex-direction: row;
      flex-direction: row;
      border: 1px solid #ebeef5;
      border-radius: 5px;
      padding: 6px;
      margin-bottom: 6px;
    }

    .service__gooditem .gooditem__name {
      -webkit-box-flex: 1;
      -ms-flex: 1;
      flex: 1;
      text-align: left;
      font-size: 14px;
      font-weight: 700;
    }

    .service__gooditem .gooditem__spec {
      font-size: 14px;
      font-weight: 400;
    }

    .chaoma__item {
      margin-right: 6px;
      padding: 0 4px;
      background: #81d3f896;
      border-radius: 3px;
      color: #09f;
    }

    .money__color {
      color: #f59a23;
    }

    .mt5 {
      background: #fee;
      display: inline-block;
      padding: 2px 6px;
    }
  }
}

::v-deep .el-steps--simple {
  padding: 13px;
}

::v-deep .el-drawer__header {
  margin-bottom: 0px !important;
}

::v-deep .el-drawer .el-drawer__body {
  padding: 0px 20px !important;
}

::v-deep .el-step__title {
  max-width: 80% !important;
}
::v-deep .el-step__arrow {
  flex: 0 1 30px;
}
</style>
