<script setup lang="ts">
import { onMounted, ref } from "vue";
import { TabsPaneContext } from "element-plus";
import type { TableColumnCtx } from "element-plus";
import axiosInstance from "../request";
import type { DrawerProps } from "element-plus";

const drawer = ref(false);
const direction = ref<DrawerProps["direction"]>("rtl");
const allpromotion = ref<any[]>([]);

const categoriesdata = ref<any[]>([]);

const getCategories = async () => {
	const res = await axiosInstance.post(
		"https://data.andupchain.com/api/Test/CommonApi",
		{
			url: "https://api.xiaocan.com.cn/partner/api/categories?tree=1",
			
      header: {
        authentication: window.localStorage.getItem("cookiename"),
        "show-all-subject": "0",
        referer: "https://huoban.xiaocan.com.cn/",
      },
			type: "1",
		}
	);
	categoriesdata.value = JSON.parse(res.data.data).data;
};

const goodsdata = ref<any[]>([]);
const loading = ref(true);
const goodsTotal = ref(0);

const getCommodity = async () => {
	let url = `https://api.xiaocan.com.cn/partner/api/goods?page=${
		currentPage.value
	}&limit=70&show_off_sale=${checked4.value ? 1 : 0}&show_partner_price=${
		checked3.value ? 1 : 0
	}`;

	if (activecategory_id.value) {
		url += `&category_id=${activecategory_id.value}`;
	} else {
		url += `&parent_category_id=${activeparent_category_id.value}`;
	}
	if (select.value != "9") {
		url += `&is_on_sale=${select.value}`;
	}
	if (keyword.value) {
		url += `&keyword=${keyword.value}`;
	}
	if (checked2.value) {
		url += `&is_activity=1`;
	}
	if (checked1.value) {
		url += `&isOrderVolume=true&sortOrderVolume=desc`;
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
		}
	);
	goodsdata.value = disposeGoodsData(JSON.parse(res.data.data).data.goods);
	loading.value = false;
	goodsTotal.value = JSON.parse(res.data.data).data.total;
	if (activecategory_id.value == 0) return;
	axiosInstance
		.post("https://data.andupchain.com/api/Test/CommonApi", {
			url: `https://api.xiaocan.com.cn/partner/api/goods/group?page=1&limit=90999&categoryId=${activecategory_id.value}&isShow=0`,
			
      header: {
        authentication: window.localStorage.getItem("cookiename"),
        "show-all-subject": "0",
        referer: "https://huoban.xiaocan.com.cn/",
      },
			type: "1",
		})
		.then((res) => {
			groups.value = JSON.parse(res.data.data).data.rows;
		});
};

const disposeGoodsData = (data: any) => {
	var flattened: any[] = [];
	data.forEach((item: any) => {
		if (item.is_chaoma) {
			const obj = {
				...item,
				GoodSpecificationname: "抄码",
			} as any;
			flattened.push(obj);
		} else {
			item.GoodSpecifications.forEach((item2: any) => {
				const obj = {
					...item,
				} as any;
				for (const key in item2) {
					if (Object.prototype.hasOwnProperty.call(item2, key)) {
						obj[`GoodSpecification${key}`] = item2[key];
					}
				}
				flattened.push(obj);
			});
		}
	});
	return flattened;
};

const groups = ref<any[]>([]);

const activecategory_id = ref(0);
const activeparent_category_id = ref(0);
const handleClickOrder = (pane: TabsPaneContext) => {
	activeparent_category_id.value = pane.paneName as number;
	groups.value = [];
	currentPage.value = 1;
	getCommodity();
};

const handleClick = (id: number) => {
	activecategory_id.value = id;
	currentPage.value = 1;
	getCommodity();
};

const keyword = ref("");
const select = ref("9");

const SelectChange = () => {
	currentPage.value = 1;
	getCommodity();
};

const Search = () => {
	currentPage.value = 1;
	getCommodity();
};

const checked1 = ref(false);
const checked2 = ref(false);
const checked3 = ref(false);
const checked4 = ref(false);
const checked5 = ref(true);

const currentPage = ref(1);

const handleCurrentChange = (val: number) => {
	currentPage.value = val;
	getCommodity();
};

interface SpanMethodProps {
	row: any;
	column: TableColumnCtx<any>;
	rowIndex: number;
	columnIndex: number;
}
function SpanMethod(
	{ row, column, rowIndex }: SpanMethodProps,
	data: any,
	SortArr: string[],
	keyCode: string
) {
	let cellValue = row[keyCode]; //当前位置的值
	if (cellValue && SortArr.includes(column.property)) {
		let prevRow = data[rowIndex - 1]; //获取到上一条数据
		let nextRow = data[rowIndex + 1]; //下一条数据
		if (prevRow && prevRow[keyCode] === cellValue) {
			//当有上一条数据，并且和当前值相等时
			return { rowspan: 0, colspan: 0 };
		} else {
			let countRowspan = 1;
			while (nextRow && nextRow[keyCode] === cellValue) {
				//当有下一条数据并且和当前值相等时,获取新的下一条
				nextRow = data[++countRowspan + rowIndex];
			}
			if (countRowspan > 1) {
				return { rowspan: countRowspan, colspan: 1 };
			}
		}
	}
}

const arraySpanMethod = ({
	row,
	column,
	rowIndex,
	columnIndex,
}: SpanMethodProps) => {
	return SpanMethod(
		{ row, column, rowIndex, columnIndex },
		goodsdata.value,
		["name", "partner_sell_volume_30", "status"],
		"id"
	);
};

const showallpromotionName = ref("");

const showallpromotion = (item: any) => {
	drawer.value = true;
	showallpromotionName.value = item.name;
	axiosInstance
		.post("https://data.andupchain.com/api/Test/CommonApi", {
			url: `https://api.xiaocan.com.cn/partner/api/goods/all-promotion?id=${item.id}`,
			
      header: {
        authentication: window.localStorage.getItem("cookiename"),
        "show-all-subject": "0",
        referer: "https://huoban.xiaocan.com.cn/",
      },
			type: "1",
		})
		.then((res) => {
			allpromotion.value = JSON.parse(res.data.data).data;
		});
};

const isPhone = ref(false);

const allpromotionTypeAll = ["", "", "商品满赠", "满减套餐", "下单返利"];
function isMobile() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	);
}
const isExpanded = ref(false);
const toggleSidebar = () => {
	isExpanded.value = !isExpanded.value;
};

onMounted(() => {
	getCategories();
	console.log(window);
	isPhone.value = isMobile();
	console.log(isPhone.value);
	currentPage.value = 1;
	getCommodity();
});
</script>

<template>
	<div class="home">
		<div style="height: 100%; width: 190px" v-if="!isPhone">
			<el-tabs
				type="border-card"
				tab-position="left"
				@tab-click="handleClickOrder"
			>
				<el-tab-pane label="全部" name="0">
					<div class="categoryChild">
						<div
							:class="['categoryChildItem', 'active']"
							@click="handleClick(0)"
						>
							全部
						</div>
					</div>
				</el-tab-pane>
				<el-tab-pane
					:label="item.label"
					v-for="item in categoriesdata"
					:key="item.id"
					:name="item.id"
				>
					<div class="categoryChild">
						<div
							:class="[
								'categoryChildItem',
								activecategory_id == 0 ? 'active' : '',
							]"
							@click="handleClick(0)"
						>
							全部
						</div>
						<div
							v-for="item2 in item.children"
							:key="item2.id"
							:class="[
								'categoryChildItem',
								activecategory_id == item2.id ? 'active' : '',
							]"
							@click="handleClick(item2.id)"
						>
							{{ item2.label }}
						</div>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>

		<div
			style="
				height: calc(100% - 60px);
				position: fixed;
				top: 60px;
				left: 0;
				z-index: 999;
			"
			:if="isPhone"
			:class="[
				'sidebar',
				{ 'sidebar--expanded': isExpanded, 'sidebar--mobile': isPhone },
			]"
		>
			<button
				class="toggle-button"
				:class="[{ 'toggle-mobile': isPhone && isExpanded }]"
				@click="toggleSidebar"
			>
				<span v-if="isExpanded">
					<el-icon>
						<ArrowLeft />
					</el-icon>
				</span>
				<span v-else>
					<el-icon>
						<ArrowRight />
					</el-icon>
				</span>
			</button>
			<el-tabs
				type="border-card"
				tab-position="left"
				style="height: 100%"
				@tab-click="handleClickOrder"
			>
				<el-tab-pane label="全部" name="0">
					<div class="categoryChild">
						<div
							:class="['categoryChildItem', 'active']"
							@click="handleClick(0)"
						>
							全部
						</div>
					</div>
				</el-tab-pane>
				<el-tab-pane
					:label="item.label"
					v-for="item in categoriesdata"
					:key="item.id"
					:name="item.id"
				>
					<div class="categoryChild">
						<div
							:class="[
								'categoryChildItem',
								activecategory_id == 0 ? 'active' : '',
							]"
							@click="handleClick(0)"
						>
							全部
						</div>
						<div
							v-for="item2 in item.children"
							:key="item2.id"
							:class="[
								'categoryChildItem',
								activecategory_id == item2.id ? 'active' : '',
							]"
							@click="handleClick(item2.id)"
						>
							{{ item2.label }}
						</div>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>

		<div
			class="content"
			:style="{ width: isPhone ? '100%' : 'calc(100% - 190px)' }"
		>
			<div class="search">
				<el-input
					v-model="keyword"
					style="max-width: max(100%, 500px)"
					placeholder="支持名称/编号/拼音模糊搜索"
					class="input-with-select"
				>
					<template #prepend>
						<el-select
							v-model="select"
							placeholder="Select"
							style="width: 115px"
							@change="SelectChange"
						>
							<el-option label="全部状态" value="9" />
							<el-option label="已上架" value="1" />
							<el-option label="已下架" value="0" />
							<el-option label="即将到货" value="2" />
						</el-select>
					</template>
					<template #append>
						<el-button @click="Search"> 搜索 </el-button>
					</template>
				</el-input>
				<div class="checkbox">
					<el-checkbox
						v-model="checked1"
						label="仅显示近30天动销商品 "
						size="large"
						@change="Search"
					/>
					<el-checkbox
						v-model="checked2"
						label="仅显示活动商品"
						size="large"
						@change="Search"
					/>
					<el-checkbox
						v-model="checked3"
						label="仅查看已调价商品"
						size="large"
						@change="Search"
					/>
					<el-checkbox
						v-model="checked4"
						label="显示下架商品"
						size="large"
						@change="Search"
					/>
					<el-checkbox v-model="checked5" label="显示销量" size="large" />
				</div>
			</div>
			<div class="groups" v-if="groups.length">
				<el-tag
					type="primary"
					size="default"
					effect="plain"
					style="margin: 5px"
				>
					全部
				</el-tag>
				<el-tag
					v-for="item in groups"
					:key="item.id"
					type="primary"
					size="default"
					effect="plain"
					style="margin: 5px"
				>
					{{ item.name }} {{ item.goods_count }}
				</el-tag>
			</div>

			<div class="tableBox">
				<el-table
					:data="goodsdata"
					v-loading="loading"
					height="100%"
					border
					:span-method="arraySpanMethod"
				>
					<el-table-column prop="name" label="" width="85">
						<template #default="scope">
							<div class="imgBox">
								<img
									:src="`${scope.row.list_pic_url}!super_goods_list_pic`"
									alt=""
								/>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="name" label="商品名称" width="280">
						<template #default="scope">
							<div class="nameBox">
								<div class="name">{{ scope.row.name }}</div>

								<el-tag
									type="success"
									size="default"
									effect="plain"
									v-if="scope.row.is_islamic"
									>清真</el-tag
								>
								<el-tag
									type="info"
									size="default"
									effect="plain"
									v-if="scope.row.is_easy_thaw"
									>易解冻</el-tag
								>
								<el-tag
									type="primary"
									size="default"
									effect="plain"
									v-if="scope.row.is_new"
									>新品</el-tag
								>

								<el-tag
									type="danger"
									size="default"
									effect="plain"
									@click="showallpromotion(scope.row)"
									v-for="(item, index) in scope.row.promotion_tag"
									:key="index"
									>{{ item }}</el-tag
								>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="status" label="状态" width="80">
						<template #default="scope">
							<el-tag v-if="scope.row.is_on_sale == 1" type="primary"
								>上架</el-tag
							>
							<el-tag v-else-if="scope.row.is_on_sale == 0" type="danger"
								>下架</el-tag
							>
							<el-tag v-else-if="scope.row.is_on_sale == 2" type="warning"
								>即将到货</el-tag
							>
						</template>
					</el-table-column>
					<el-table-column prop="GoodSpecificationname" label="规格" />
					<el-table-column label="供货价">
						<template #default="scope">
							<div class="priceBox">
								<span>{{
									$currency(
										scope.row.GoodSpecificationpartnerCounterPrice ??
											scope.row.partnerCounterPrice
									).format()
								}}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="price" label="总部售价">
						<template #default="scope">
							<div class="priceBox">
								<span>{{
									$currency(
										scope.row.GoodSpecificationretail_price ??
											scope.row.average_price
									).format()
								}}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="price" label="区域售价">
						<template #default="scope">
							<div class="priceBox">
								<span>{{
									$currency(
										scope.row.GoodSpecificationpartnerRetailPrice ??
											scope.row.partnerUnitPrice / 100
									).format()
								}}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column
						prop="partner_sell_volume_30"
						label="近30天销量"
						v-show="checked5"
					>
						<template #default="scope">
							<div class="priceBox">
								<span>{{ scope.row.partner_sell_volume_30 }}件</span>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="pagination">
				<el-pagination
					v-model:current-page="currentPage"
					:page-size="70"
					:background="true"
					layout="total, prev, pager, next"
					:total="goodsTotal"
					@current-change="handleCurrentChange"
				/>
			</div>
		</div>
	</div>
	<el-drawer v-model="drawer" :direction="direction" :size="isPhone? '100%': '30%'">
		<template #header>
			<h4 style="text-align: left">{{ showallpromotionName }}</h4>
		</template>
		<div class="allpromotion">
			<div
				v-for="item in allpromotion"
				:key="item.type"
				class="allpromotionItem"
			>
				<p style="margin-bottom: 10px">
					<el-tag type="danger">{{ allpromotionTypeAll[item.type] }}</el-tag>
					<b> {{ item.type == 2 ? item.promotionName : "" }}</b>
				</p>
				<template v-if="item.type == 3">
					<p v-for="(it, index) in item.details" :key="index">
						{{ it }}
					</p>
				</template>

				<template v-if="item.type == 2">
					<p>{{ item.beginTime }} ~ {{ item.endTime }}</p>
					<p v-for="(it, index) in item.details" :key="index">
						{{ it }}
					</p>
				</template>

				<template v-if="item.type == 4">
					<p v-for="(it, index) in item.details[0].rows" :key="index">
						<span style="width: 150px">{{ it.specName }}</span>
						<span
							>返利金额{{ $currency(it.price).format() }}/{{
								it.unitName
							}}</span
						>
					</p>
				</template>
			</div>
		</div>
	</el-drawer>
</template>

<style scoped lang="scss">
div {
	box-sizing: border-box;
}

.home {
	width: 100%;
	flex: 1;
	height: calc(100vh - 60px);
	display: flex;
	background: #f3f4f7;

	.categoryChild {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: #fff;

		.categoryChildItem {
			padding: 10px;
			text-align: center;
			cursor: pointer;

			&.active {
				color: #409eff;
			}

			&:hover {
				background-color: #f5f7fa;
				color: #409eff;
			}
		}
	}

	.content {
		height: 100%;
		padding: 10px;
		display: flex;
		flex-direction: column;

		.search {
			padding: 10px;
			width: 100%;
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: space-between;
			background-color: #fff;
			margin-bottom: 10px;

			.checkbox {
				height: 100%;
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				overflow: hidden;
			}
		}

		.groups {
			padding: 5px 10px;
			display: flex;
			align-items: center;
			background-color: #fff;
			margin-bottom: 10px;
		}

		.tableBox {
			box-sizing: border-box;
			flex: 1;
			min-height: 0;
			padding: 10px;
			overflow: hidden;
			background-color: #fff;

			.imgBox {
				width: 50px;
				aspect-ratio: auto 50 / 50;
				height: 50px;
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
	.sidebar {
		width: 0px;
		/* 默认宽度 */
		transition: width 0.3s ease;
		background-color: #333;
		cursor: pointer;
		/* 添加相对定位，以便定位按钮 */
	}

	.sidebar--expanded {
        width: 190px;
		/* 伸缩后的宽度 */
	}

	.sidebar--mobile {
		position: absolute;
		top: 0px;
		left: 0px;
		height: 100%;
		z-index: 9;
	}

	/* 淡入淡出动画 */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	.content--expanded {
		animation: fadeIn 0.3s ease;
	}

	/* 按钮样式 */
	.toggle-button {
		position: absolute;
		/* 绝对定位，相对于 sidebar */
		width: 10px;
		top: 50%;
		right:  -10px;
		/* 放在侧边栏的侧面 */
		transform: translateY(-50%);
		background-color: #444;
		color: #fff;
		border: none;
		padding: 10px 0;
		font-size: 18px;
		cursor: pointer;
		transition: background-color 0.3s ease;
		border-radius: 0 5px 5px 0;
		/* 只有左边有圆角 */
		display: flex;
		justify-content: center;
		align-items: center;

		&::before {
			position: absolute;
			content: "";
			width: 5px;
			height: 5px;
			background: radial-gradient(circle at 5px 0, transparent 5px, #444 5px);
			left: 0;
			top: -5px;
		}

		&::after {
			position: absolute;
			content: "";
			width: 5px;
			height: 5px;
			background: radial-gradient(circle at 5px 5px, transparent 5px, #444 5px);
			left: 0;
			bottom: -5px;
		}
	}


	.toggle-button:hover {
		background-color: #555;
	}
}

.allpromotion {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: flex-start;

	.allpromotionItem {
		background-color: #fafafa;
		padding: 10px;
		width: 100%;
		box-sizing: border-box;
		font-size: 13px;
		color: #606266;
		border: 1px solid #eeeeee;
		text-align: left;
		margin-bottom: 10px;
		p {
			margin: 0;
		}
	}
}

::v-deep .el-tabs__content {
	padding: 0;
}

::v-deep .el-tabs--left .el-tabs__header.is-left {
	margin-bottom: 0;
	margin-right: 0px;
}

::v-deep .el-table--enable-row-hover .el-table__body tr:hover > td {
	background-color: #f8e219 !important;
}
</style>
