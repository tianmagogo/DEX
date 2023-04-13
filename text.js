// 设置CEX和DEX的API
const cexApi = 'https://cex.io/api';
const dexApi = 'https://api.dex.com/v1';

// 获取CEX和DEX上的SHIB/USDT的买卖价格和深度
async function getPricesAndDepth() {
  // 获取CEX上的买卖价格和深度
  const cexUrl = `${cexApi}/order_book/SHIB/USDT`;
  const cexResponse = await fetch(cexUrl);
  const cexData = await cexResponse.json();
  const cexBuyPrice = cexData.bid[0];
  const cexSellPrice = cexData.ask[0];
  const cexBuyDepth = cexData.bids.reduce((acc, [price, amount]) => acc + amount, 0);
  const cexSellDepth = cexData.asks.reduce((acc, [price, amount]) => acc + amount, 0);

  // 获取DEX上的买卖价格和深度
  const dexUrl = `${dexApi}/markets/SHIB_USDT/orderbook?depth=1`;
  const dexResponse = await fetch(dexUrl);
  const dexData = await dexResponse.json();
  const dexBuyPrice = dexData.bids[0].price;
  const dexSellPrice = dexData.asks[0].price;
  const dexBuyDepth = dexData.bids[0].amount;
  const dexSellDepth = dexData.asks[0].amount;

  // 返回获取的价格和深度信息
  return {
    cex: {
      buyPrice: cexBuyPrice,
      sellPrice: cexSellPrice,
      buyDepth: cexBuyDepth,
      sellDepth: cexSellDepth,
    },
    dex: {
      buyPrice: dexBuyPrice,
      sellPrice: dexSellPrice,
      buyDepth: dexBuyDepth,
      sellDepth: dexSellDepth,
    },
  };
}

// 计算套利机会并执行交易
async function executeArbitrage() {
  // 获取CEX和DEX上的价格和深度
  const { cex, dex } = await getPricesAndDepth();

  // 如果CEX的买价高于DEX的卖价，执行套利，买入DEX上的SHIB，卖出CEX上的SHIB
  if (cex.buyPrice > dex.sellPrice) {
    // 计算可以在DEX上买入的SHIB数量
    const maxBuyAmount = Math.min(dex.buyDepth, cex.sellDepth);

    // 如果DEX上没有足够的SHIB可供购买，直接返回
    if (maxBuyAmount === 0) {
      console.log('DEX has no SHIB to buy');
      return;
    }

    // 计算在DEX上买入SHIB需要支付的USDT数量
    const buyCost = maxBuyAmount * dex.buyPrice;

    // 如果CEX上的USDT不足以卖出所有的SHIB，直接返回
    if (buyCost > cex.sellDepth * cex.sellPrice) {
      console.log('CEX has not enough USDT to sell all SHIB');
      return;
    }

    // 在DEX上买入SHIB
    console.log(`


async function getCEXOrderBookDepth(symbol) {
  try {
    const response = await axios.get(`https://cex.io/api/order_book/${symbol}/`);
    const orderBook = response.data;

    // 订单簿深度信息
    const depth = {
      asks: [], // 卖单
      bids: [], // 买单
    };

    // 解析卖单信息
    for (let i = 0; i < orderBook.asks.length; i++) {
      const ask = orderBook.asks[i];
      depth.asks.push({
        price: parseFloat(ask[0]),
        amount: parseFloat(ask[1]),
      });
    }

    // 解析买单信息
    for (let i = 0; i < orderBook.bids.length; i++) {
      const bid = orderBook.bids[i];
      depth.bids.push({
        price: parseFloat(bid[0]),
        amount: parseFloat(bid[1]),
      });
    }

    return depth;
  } catch (error) {
    console.error(`Failed to get CEX order book depth for ${symbol}: ${error.message}`);
    return null;
  }
}


async function getDEXOrderBookDepth(symbol) {
  try {
    const response = await axios.post(`https://api.1inch.exchange/v3.0/${symbol}/orderbook`, {
      "fromTokenAddress": "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", // SHIB token address
      "toTokenAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH token address
      "swapAmount": "0.00001", // 交易数量，这里我们只需要获取订单簿深度，所以数量可以设置为一个较小的值
      "slippage": "1", // 滑点
      "disabledExchanges": [], // 禁用的交易所
      "excludedSources": ["0x338D44eBa8c4B7a190Bd8A19a7eB9C2e8a73f1c9"], // 不包含的交易源
      "fee": "22000", // 交易费用
      "gasPrice": "30000000000", // Gas价格
      "gas": "200000", // Gas数量
    });
    const orderBook = response.data;

    // 订单簿深度信息
    const depth = {
      asks: [], // 卖单
      bids: [], // 买单
    };

    // 解析卖单信息
    for (let i = 0; i < orderBook.toToken.length; i++) {
      const ask = orderBook.toToken[i];
      depth.asks.push({
        price: parseFloat(ask.price),
        amount: parseFloat(ask.volume),



// 根据当前价格和深度计算可交易数量
function calculateAmount(price, depth) {
  let total = 0;
  let amount = 0;
  for (let i = 0; i < depth.length; i++) {
    const [p, q] = depth[i];
    if (p >= price) {
      total += p * q;
      if (total >= amount) {
        amount = total / price;
        break;
      }
    } else {
      break;
    }
  }
  return amount;
}

// 在CEX上卖出SHIB，在DEX上买入SHIB
function arbitrageSell(shibAmount, cexBuyPrice, cexBuyDepth, dexSellPrice, dexSellAmount) {
  // 在CEX上卖出SHIB
  const cexSellPrice = cexBuyPrice;
  const cexSellAmount = calculateAmount(cexSellPrice, cexBuyDepth);
  console.log(`在CEX上以 ${cexSellPrice} 的价格卖出 ${cexSellAmount} 个 SHIB`);

  // 在DEX上买入SHIB
  const dexBuyAmount = shibAmount;
  const dexBuyPrice = dexSellPrice;
  const dexBuyCost = dexBuyAmount * dexBuyPrice;
  console.log(`在DEX上以 ${dexBuyPrice} 的价格买入 ${dexBuyAmount} 个 SHIB`);

  // 计算收益
  const profit = (cexSellAmount * cexSellPrice - dexBuyCost).toFixed(8);
  console.log(`套利收益为 ${profit}`);
}

// 在CEX上买入SHIB，在DEX上卖出SHIB
function arbitrageBuy(shibAmount, cexSellPrice, cexSellDepth, dexBuyPrice, dexBuyAmount) {
  // 在CEX上买入SHIB
  const cexBuyAmount = shibAmount;
  const cexBuyCost = cexBuyAmount * cexSellPrice;
  console.log(`在CEX上以 ${cexSellPrice} 的价格买入 ${cexBuyAmount} 个 SHIB`);

  // 在DEX上卖出SHIB
  const dexSellPrice = dexBuyPrice;
  const dexSellAmount = calculateAmount(dexSellPrice, dexBuyAmount);
  console.log(`在DEX上以 ${dexSellPrice} 的价格卖出 ${dexSellAmount} 个 SHIB`);

  // 计算收益
  const profit = (cexBuyCost - dexSellPrice * dexSellAmount).toFixed(8);
  console.log(`套利收益为 ${profit}`);
}

// 调用套利函数
const shibAmount = 1000;
const cexBuyPrice = 0.9;
const cexSellPrice = 1.0;
const dexSellPrice = 1.0;
const dexBuyPrice = 0.8;
const cexBuyDepth = [
  [0.91, 100],
  [0.92, 200],
  [0.93, 300],
  [0.94, 400],
  [0.95, 500]
];
const cexSellDepth = [
  [1.0, 100],
  [1.1, 200],
  [1.2, 300],
  [1.3, 400],
  [1.4, 500]
];



// 计算DEX和CEX交易所的差价
async function calculatePriceDifferential(dexTokenPair, cexTokenPair) {
  const dexAskPrice = await getAskPrice(dexTokenPair)
  const cexBidPrice = await getBidPrice(cexTokenPair)

  const priceDiff = cexBidPrice - dexAskPrice

  return priceDiff
}

// 在CEX交易所卖出
async function sellOnCEX(amountToSell, cexTokenPair) {
  const cex = new CEXExchange() // 初始化CEX交易所对象

  // 获取CEX交易所的深度
  const depth = await cex.getOrderBook(cexTokenPair)

  // 找到可以出售给买方的价格
  let sellPrice
  let sellAmount = 0
  for (const ask of depth.asks) {
    if (amountToSell <= 0) {
      break
    }
    if (amountToSell >= ask.amount) {
      sellAmount += ask.amount
      sellPrice = ask.price
      amountToSell -= ask.amount
    } else {
      sellAmount += amountToSell
      sellPrice = ask.price
      amountToSell = 0
    }
  }

  if (amountToSell > 0) {
    console.log(`Insufficient liquidity on CEX to sell ${amountToSell} ${cexTokenPair.baseSymbol}`)
    return
  }

  // 执行卖单交易
  const sellOrder = await cex.createLimitOrder(cexTokenPair, 'SELL', sellAmount, sellPrice)
  console.log(`Sold ${sellOrder.amount} ${cexTokenPair.baseSymbol} on CEX at price ${sellOrder.price}`)
  return sellOrder
}

// 在DEX交易所买入
async function buyOnDEX(amountToBuy, dexTokenPair) {
  const dex = new DEXExchange() // 初始化DEX交易所对象

  // 获取DEX交易所的深度
  const depth = await dex.getOrderBook(dexTokenPair)

  // 找到可以从卖方购买的价格
  let buyPrice
  let buyAmount = 0
  for (const bid of depth.bids) {
    if (amountToBuy <= 0) {
      break
    }
    if (amountToBuy >= bid.amount) {
      buyAmount += bid.amount
      buyPrice = bid.price
      amountToBuy -= bid.amount
    } else {
      buyAmount += amountToBuy
      buyPrice = bid.price
      amountToBuy = 0
    }
  }

  if (amountToBuy > 0) {
    console.log(`Insufficient liquidity on DEX to buy ${amountToBuy} ${dexTokenPair.quoteSymbol}`)
    return
  }

  // 执行买单交易
  const buyOrder = await dex.createLimitOrder(dexTokenPair, 'BUY', buyAmount, buyPrice)
  console.log(`Bought ${buyOrder.amount} ${dexTokenPair.baseSymbol} on DEX at price ${buyOrder.price}`)
  return buyOrder
}

// 进行套利交易
async function executeArbitrage(tradeAmount, dexTokenPair, cexTokenPair) {
  const priceDiff = await calculatePriceDifferential(dexTokenPair, cexTokenPair)

  if (priceDiff <= 0) {
    console.log(`No arbitrage opportunity found. CEX ${cex



// 获取DEX的卖单价格和数量
const [dexSellPrice, dexSellAmount] = await dex.getSellPriceAndAmount();

// 判断CEX的买价是否高于DEX的卖价
if (cexBuyPrice > dexSellPrice) {
  // 计算可以在CEX卖出的数量
  const cexSellAmount = Math.min(cexBuyAmount, cexBuyDepth);

  // 在CEX上下卖单
  const cexOrderId = await cex.sell(cexSellAmount, cexBuyPrice);

  // 在DEX上下买单
  const dexOrderId = await dex.buy(cexSellAmount, dexSellPrice);

  console.log(`Arbitrage opportunity found: sell ${cexSellAmount} SHIB at ${cexBuyPrice} on CEX, and buy ${cexSellAmount} SHIB at ${dexSellPrice} on DEX.`)
  console.log(`CEX order ID: ${cexOrderId}, DEX order ID: ${dexOrderId}`);
} else if (cexSellPrice < dexBuyPrice) {
  // 计算可以在CEX买入的数量
  const cexBuyAmount = Math.min(cexSellAmount, cexSellDepth);

  // 在CEX上下买单
  const cexOrderId = await cex.buy(cexBuyAmount, cexSellPrice);

  // 在DEX上下卖单
  const dexOrderId = await dex.sell(cexBuyAmount, dexBuyPrice);

  console.log(`Arbitrage opportunity found: buy ${cexBuyAmount} SHIB at ${cexSellPrice} on CEX, and sell ${cexBuyAmount} SHIB at ${dexBuyPrice} on DEX.`)
  console.log(`CEX order ID: ${cexOrderId}, DEX order ID: ${dexOrderId}`);
} else {
  console.log("No arbitrage opportunity found.");
}
