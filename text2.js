获取CEX和DEX价格数据模块
const axios = require('axios');
const binanceAPI = 'https://api.binance.com/api/v3/ticker/price?symbol=';
const dexAPI = 'https://api.dex.guru/v1/tokens/';
const symbols = ['ETHUSDT', 'DAIETH', 'UNIETH'];

// 获取币安和DEX的价格数据
async function getPriceData() {
  let cexData = {}; // 存储CEX价格数据
  let dexData = {}; // 存储DEX价格数据

  // 获取币安价格数据
  for (const symbol of symbols) {
    const cexURL = binanceAPI + symbol;
    const response = await axios.get(cexURL);
    cexData[symbol] = parseFloat(response.data.price);
  }

  // 获取DEX价格数据
  for (const symbol of symbols) {
    const dexURL = dexAPI + symbol;
    const response = await axios.get(dexURL);
    dexData[symbol] = parseFloat(response.data.priceUSD);
  }

  return { cexData, dexData };
}
// 获取CEX和DEX当前市场订单簿数据
const getCexOrderbook = async (symbol) => {
  // 使用币安API获取CEX订单簿数据
  const response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}`);
  const data = await response.json();
  // 格式化订单簿数据
  const bids = data.bids.map(bid => ({ price: Number(bid[0]), amount: Number(bid[1]) }));
  const asks = data.asks.map(ask => ({ price: Number(ask[0]), amount: Number(ask[1]) }));
  // 返回订单簿数据
  return { bids, asks };
};

const getDexOrderbook = async (symbol) => {
  // 使用DEX API获取订单簿数据
  const response = await fetch(`https://api.dex.guru/v1/tokens/${symbol}/orderbook`);
  const data = await response.json();
  // 格式化订单簿数据
  const bids = data.bids.map(bid => ({ price: Number(bid.price), amount: Number(bid.size) }));
  const asks = data.asks.map(ask => ({ price: Number(ask.price), amount: Number(ask.size) }));
  // 返回订单簿数据
  return { bids, asks };
};

// 计算深度和交易量
const calculateDepthAndVolume = (orderbook) => {
  // 将买入和卖出订单按价格排序
  const bids = orderbook.bids.sort((a, b) => b.price - a.price);
  const asks = orderbook.asks.sort((a, b) => a.price - b.price);
  // 计算每个价格点的累计买入和卖出量
  for (let i = 1; i < bids.length; i++) {
    bids[i].totalAmount = bids[i - 1].totalAmount + bids[i].amount;
  }
  for (let i = 1; i < asks.length; i++) {
    asks[i].totalAmount = asks[i - 1].totalAmount + asks[i].amount;
  }
  // 找到交易数量
  let volume = 0;
  let depth = 0;
  for (let i = 0; i < bids.length; i++) {
    if (asks[i].price > bids[i].price) {
      volume += Math.min(bids[i].totalAmount, asks[i].totalAmount);
      depth += bids[i].price * Math.min(bids[i].totalAmount, asks[i].totalAmount);
    } else {
      break;
    }
  }
  // 返回交易深度和交易数量
  return { depth, volume };
};
// 定义交易执行函数
const executeTrade = async (symbol, side, amount, price) => {
  // 使用币安API执行交易
  const res = await fetch('https://api.binance.com/api/v3/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-MBX-APIKEY': API_KEY
    },
    body: `symbol=${symbol}&side=${side}&type=LIMIT&timeInForce=GTC&quantity=${amount}&price=${price}`
  });
  const data = await res.json();
  // 返回交易结果
  return data;
};

// 定义交易函数
const executeArbitrage = async (symbol, cexOrderbook, dexOrderbook) => {
  // 获取最佳交易价格和交易数量
  const { cexPrice, dexPrice, volume } = getBestPriceAndVolume(cexOrderbook, dexOrderbook);
  // 执行交易
  if (cexPrice > dexPrice) {
    await executeTrade(symbol, 'SELL', volume, dexPrice);
    await executeTrade(symbol, 'BUY', volume, cexPrice);
  } else {
    await executeTrade(symbol, 'BUY', volume, cexPrice);
    await executeTrade(symbol, 'SELL', volume, dexPrice);
  }
};

// 定义主函数
const main = async () => {
  // 获取CEX和DEX订单簿数据
  const cexOrderbook = await getCexOrderbook(SYMBOL);
  const dexOrderbook = await getDexOrderbook(SYMBOL);
  // 计算交易深度和交易数量
  const { depth, volume } = calculateDepthAndVolume(cexOrderbook, dexOrderbook);
  // 如果交易深度足够大，则执行套利交易
  if (depth > MIN_DEPTH && volume > MIN_VOLUME) {
    await executeArbitrage(SYMBOL, cexOrderbook, dexOrderbook);
  }
};
// 监控和调整套利策略
const monitorAndAdjustStrategy = async (cexSymbol, dexSymbol, maxSpread, maxSlippage, minProfit) => {
  // 获取CEX和DEX当前市场价格数据
  const cexPrice = await getCexPrice(cexSymbol);
  const dexPrice = await getDexPrice(dexSymbol);
  // 计算当前的价差和滑点
  const spread = (dexPrice - cexPrice) / cexPrice;
  const slippage = (cexPrice - dexPrice) / cexPrice;
  // 如果当前价差大于最大价差或者当前滑点大于最大滑点，停止套利
  if (spread > maxSpread || slippage > maxSlippage) {
    console.log(`Spread: ${spread}, Slippage: ${slippage}. Pausing trading.`);
    isTradingPaused = true;
    return;
  }
  // 计算当前的交易深度和交易数量
  const cexOrderbook = await getCexOrderbook(cexSymbol);
  const dexOrderbook = await getDexOrderbook(dexSymbol);
  const cexDepthAndVolume = calculateDepthAndVolume(cexOrderbook);
  const dexDepthAndVolume = calculateDepthAndVolume(dexOrderbook);
  // 如果当前的交易数量小于最小交易数量，停止套利
  if (cexDepthAndVolume.volume < MIN_TRADE_AMOUNT || dexDepthAndVolume.volume < MIN_TRADE_AMOUNT) {
    console.log(`CEX volume: ${cexDepthAndVolume.volume}, DEX volume: ${dexDepthAndVolume.volume}. Pausing trading.`);
    isTradingPaused = true;
    return;
  }
  // 计算当前的利润
  const profit = cexPrice * cexDepthAndVolume.volume * (1 - CEX_TRADING_FEE) - dexPrice * dexDepthAndVolume.volume * (1 + DEX_TRADING_FEE);
  // 如果当前的利润小于最小利润，停止套利
  if (profit < minProfit) {
    console.log(`Profit: ${profit}. Pausing trading.`);
    isTradingPaused = true;
    return;
  }
  // 如果套利已经暂停，重新开始套利
  if (isTradingPaused) {
    console.log('Resuming trading.');
    isTradingPaused = false;
  }
};
	// 数据记录模块
	class DataRecorder {
	  constructor() {
		this.tradeHistory = []; // 交易历史
		this.profitHistory = []; // 利润历史
	  }

	  // 记录交易
	  recordTrade(trade) {
		this.tradeHistory.push(trade);
	  }

	  // 记录利润
	  recordProfit(profit) {
		this.profitHistory.push(profit);
	  }

	  // 获取交易历史
	  getTradeHistory() {
		return this.tradeHistory;
	  }

	  // 获取利润历史
	  getProfitHistory() {
		return this.profitHistory;
	  }
	}
// 用户界面模块
class UserInterface {
  constructor() {
    this.dataRecorder = new DataRecorder();
    this.profitThreshold = 0.01; // 设置利润阈值
    this.interval = 10000; // 设置轮询间隔
  }

  // 开始运行套利系统
  start() {
    console.log('套利系统开始运行...');
    setInterval(() => {
      const cexData = CEXDataFetcher.fetchData();
      const dexData = DEXDataFetcher.fetchData();
      const arbitrageOpportunity = ArbitrageCalculator.calculateArbitrageOpportunity(cexData, dexData);
      if (arbitrageOpportunity.profit > this.profitThreshold) {
        console.log(`发现套利机会：${arbitrageOpportunity.profit}%`);
        const tradeResult = TradeExecutor.executeTrade(arbitrageOpportunity, cexData, dexData);
        console.log(`交易结果：${tradeResult}`);
        this.dataRecorder.recordTrade(tradeResult);
        this.dataRecorder.recordProfit(arbitrageOpportunity.profit);
      } else {
        console.log('当前无套利机会');
      }
    }, this.interval);
  }

  // 显示交易历史
  displayTradeHistory() {
    const tradeHistory = this.dataRecorder.getTradeHistory();
    console.log('交易历史：');
    console.log(tradeHistory);
  }

  // 显示利润历史
  displayProfitHistory() {
    const profitHistory = this.dataRecorder.getProfitHistory();
    console.log('利润历史：');
    console.log(profitHistory);
  }
}
