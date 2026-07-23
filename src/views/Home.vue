<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axiosInstance from '../request';
import currency from 'currency.js';
const homeData = ref<any[]>([])

let date = new Date();
date.setHours(0, 0, 0, 0);
const placeAnOrderTime = ref([
	date.getTime() / 1000 - 3600 * 24 * 3,
	date.getTime() / 1000,
]);
const orderlistData = ref<any[]>([]);
const currentPage = ref(0)
// 销售总额
const salesTotal = ref<any[]>([]);

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 统计相同天内的价格总和
const groupByDay = (data: any[]) => {
  const result = {} as any;

  data.forEach((item: { pay_time: any; actual_price: any; }) => {
    const date = formatDate(item.pay_time);
    if (!result[date]) {
      result[date] = 0;
    }
    result[date] = currency(result[date]).add(item.actual_price);
  });

  return Object.keys(result).map(key => ({
    date: key,
    total_price: result[key]
  }));
};

const getorderData = async() =>{
    let url = `https://api.xiaocan.com.cn/partner/api/orders?page=${currentPage.value}&limit=50&add_time_start=${placeAnOrderTime.value[0]}&add_time_end=${
			placeAnOrderTime.value[1] + 3600 * 24
		}`;
    const res = await axiosInstance.post(
		"https://data.andupchain.com/api/Test/CommonApi",
		{
			url: url,
			cookie:
				`partner_auth=${window.localStorage.getItem('cookiename')}`,
			type: "1",
		}
	);
    url = `https://api.xiaocan.com.cn/partner/api/orders?page=${currentPage.value}&limit=${JSON.parse(res.data.data).data.total}&add_time_start=${placeAnOrderTime.value[0]}&add_time_end=${
			placeAnOrderTime.value[1] + 3600 * 24
		}`;
    const response = await axiosInstance.post(
    "https://data.andupchain.com/api/Test/CommonApi",
    {
        url: url,
        cookie:
            `partner_auth=${window.localStorage.getItem('cookiename')}`,
        type: "1",
    }
	);
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log( JSON.parse(response.data.data).data.orders.filter((item:any)=>{
		return item.address.indexOf('上饶') > -1 && (item.order_status_text == '已取消' && item.pay_status == 1 )
	}))
	orderlistData.value = JSON.parse(response.data.data).data.orders.filter((item:any)=>{
		// return item.address.indexOf('上饶') > -1 && ((new Date(item.pay_time * 1000).toDateString() === today.toDateString()&&item.pay_status == 1&&item.pay_status !== '已取消' )||( new Date(item.pay_time * 1000).toDateString() != today.toDateString()&&item.order_status_text == '已完成'))
		return item.address.indexOf('上饶') > -1 && (item.order_status_text != '已取消' && item.pay_status == 1 )
	});
    console.log(orderlistData.value)
    salesTotal.value = groupByDay(orderlistData.value)
    console.log(salesTotal.value)
}

onMounted(() => {
    getorderData()
})


</script>
<template>
    <div class="home">
        <el-card class="card">
            <template #header>每日销售额</template>
            <!-- card body -->
            <div style="text-align: left;">
                <p v-for="item in salesTotal" :key="item.date">{{ item.date }}：¥{{ item.total_price }}</p>
            </div>
        </el-card>
        <el-card class="card">
            <template #header>按月销售额</template>
            <!-- card body -->
            <div style="text-align: left;">
                <p>2023年10月：</p>
                <p>2023年9月：</p>
                <p>2023年8月：</p>
                <p>2023年7月：</p>
                <p>2023年7月：</p>
            </div>
        </el-card>
        <el-card class="card">
            <template #header>本月分级销售额</template>
            <!-- card body -->
            <div style="text-align: left;">
                <p>一类：</p>
                <p>二类：</p>
                <p>三类：</p>
                <p>四类：</p>
                <p>五类：</p>
            </div>
        </el-card>

        <el-card class="card">
            <template #header>业务员今日扫码量</template>
            <el-table :data="[...homeData].sort((a, b) => b.dayNewScans - a.dayNewScans)" style="width: 100%" border>
                <el-table-column type="index" width="50" />
                <el-table-column prop="biz" label="业务员" />
                <el-table-column prop="dayNewScans" label="扫码量" />
            </el-table>
        </el-card>
        <el-card class="card">
            <template #header>业务员本周扫码量</template>
            <el-table :data="[...homeData].sort((a, b) => b.weekNewScans - a.weekNewScans)" style="width: 100%" border>
                <el-table-column type="index" width="50" />
                <el-table-column prop="biz" label="业务员" />
                <el-table-column prop="weekNewScans" label="扫码量" />
            </el-table>
        </el-card>
        <el-card class="card">
            <template #header>业务本月扫码量</template>
            <el-table :data="[...homeData].sort((a, b) => b.monthNewScans - a.monthNewScans)" style="width: 100%"
                border>
                <el-table-column type="index" width="50" />
                <el-table-column prop="biz" label="业务员" />
                <el-table-column prop="monthNewScans" label="扫码量" />
            </el-table>
        </el-card>
    </div>
</template>

<style scoped lang="scss">
.home {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;

    .card {
        width: calc(100% / 3 - 20px);
        padding: 1.5em;
        padding-top: 0;
        margin: 10px 0;
    }
}
// 写一个媒体查询
@media screen and (max-width: 1200px) {
    .home {
        .card {
            width: calc(100% / 2 - 20px);
        }
    }
}

@media screen and (max-width: 768px) {
    .home {
        .card {
            width:calc(100% - 20px);
        }
    }
}
</style>

function $currency(goods_original_price: any) {
  throw new Error('Function not implemented.');
}
