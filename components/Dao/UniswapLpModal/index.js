import { ChainId, Fetcher, Route, Token }                     from "@uniswap/sdk"
import IUniswapV2ERC20                                        from "@uniswap/v2-core/build/IUniswapV2ERC20.json"
import IUniswapV2Router02                                     from "@uniswap/v2-periphery/build/IUniswapV2Router02.json"
import { BigNumber, ethers }                                  from "ethers"
import useForm                                                from "hooks/useForm"
import React                                                  from "react"
import { useDaoStore }                                        from "stores/useDaoStore"
import { useSigner }                                          from "wagmi"
import ControlledModal                                        from "components/Layout/Modal/ControlledModal"
import {flatten}                                              from '../../../utils/helpers'
import { amount, getLiquidityPairInfo, readableTokenBalance } from "./helpers"
import PoolInfo                                               from "./PoolInfo"
import TokenInput                                             from "./TokenInput"
import useGnosisTransaction                                   from "hooks/useGnosisTransaction"

const UniswapLpModal = ({ safeAddress, tokenLogos }) => {
  const UniswapV2Router02 = ethers.utils.getAddress("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
  const [{ data: signer }] = useSigner()
  const setUniswapLpModalOpen = useDaoStore(state => state.setUniswapLpModalOpen)
  const lpToken0 = useDaoStore(state => flatten(state.lpToken0))
  const lpToken1 = useDaoStore(state => flatten(state.lpToken1))
  const setLpToken1 = useDaoStore(state => state.setLpToken1)
  const setLpToken0 = useDaoStore(state => state.setLpToken0)
  const { state, setState } = useForm()
  const token0InputRef = React.useRef()
  const token1InputRef = React.useRef()
  const [pair, setPair] = React.useState()
  const [liquidityInfo, setLiquidityInfo] = React.useState({})
  const [maxError, setMaxError] = React.useState("")
  const [hasAllowance, setHasAllowance] = React.useState()
  const token0Logo = tokenLogos.filter(logo => logo.symbol === lpToken0?.symbol)[0]?.uri
  const token1Logo = tokenLogos.filter(logo => logo.symbol === lpToken1?.symbol)[0]?.uri
  const supplyDisabled =
    !signer || maxError.length > 0 || !hasAllowance?.token0 || !hasAllowance?.token1 || !hasAllowance?.pair
  const { gnosisTransaction } = useGnosisTransaction(safeAddress)
  const closeUniswapLpModal = () => {
    setLpToken0({})
    setLpToken1({})
    setUniswapLpModalOpen()
    setMaxError("")
  }

  /*  Construct object of selected tokens represented as Uniswap Token Objects */
  const uniswapTokens = React.useMemo(() => {
    const token0 = new Token(
      ChainId.MAINNET,
      lpToken0?.tokenAddress,
      lpToken0?.decimals,
      lpToken0?.symbol,
      lpToken0?.name
    )

    const token1 = new Token(
      ChainId.MAINNET,
      lpToken1?.tokenAddress,
      lpToken1?.decimals,
      lpToken1?.symbol,
      lpToken1?.name
    )

    return { [lpToken0?.symbol]: token0, [lpToken1?.symbol]: token1 }
  }, [lpToken0, lpToken1])

  /* Propose and Execute uniswapV2Router02 - addLiquidity   */
  const handleSubmit = async (e, liquidityInfo) => {
    try {
      e.preventDefault()

      const uniswapV2RouterContract02 = new ethers.Contract(UniswapV2Router02, IUniswapV2Router02["abi"], signer)
      const pairHasEth = liquidityInfo.transactionInfo.filter(token => flatten(token)?.symbol === "ETH")
      const slippage = 0.055 // default 5.5% slippage

      const token0 = flatten(liquidityInfo.transactionInfo[0])
      const token1 = flatten(liquidityInfo.transactionInfo[1])

      /* token A */
      const tokenA = token0?.address
      const tokenADecimals = token0?.decimals
      const tokenAAmount = token0?.amount
      const amountADesired = amount(tokenAAmount, tokenADecimals) // wondering if this is correct
      const amountAMin = amount(tokenAAmount - tokenAAmount * slippage, tokenADecimals)

      /* token B */
      const tokenB = token1?.address
      const tokenBDecimals = token1?.decimals
      const tokenBAmount = token1?.amount
      const amountBDesired = amount(tokenBAmount, tokenBDecimals)
      const amountBMin = amount(tokenBAmount - tokenBAmount * slippage, tokenBDecimals)

      /* addLiquidity or addLiquidityEth  */
      if (pairHasEth.length === 0) {
        gnosisTransaction(
          {
            abi: IUniswapV2Router02["abi"],
            instance: uniswapV2RouterContract02,
            fn: "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)",
            args: {
              tokenA: ethers.utils.getAddress(tokenA),
              tokenB: ethers.utils.getAddress(tokenB),
              amountADesired: BigNumber.from(amountADesired),
              amountBDesired: BigNumber.from(amountBDesired),
              amountAMin: BigNumber.from(amountAMin),
              amountBMin: BigNumber.from(amountBMin),
              addressTo: ethers.utils.getAddress(safeAddress),
              deadline: Math.floor(Date.now() / 1000) + 60 * 20,
            },
          },
          UniswapV2Router02,
          0
        )
      } else {
        const WETH = await uniswapV2RouterContract02?.WETH()
        gnosisTransaction(
          {
            abi: IUniswapV2Router02["abi"],
            instance: uniswapV2RouterContract02,
            fn: "addLiquidityETH(address,uint256,uint256,uint256,address,uint256)",
            args: {
              token: ethers.utils.getAddress(tokenA === WETH ? tokenB : tokenA),
              amountTokenDesired: tokenA === WETH ? BigNumber.from(amountBDesired) : BigNumber.from(amountADesired),
              amountTokenMin: tokenA === WETH ? BigNumber.from(amountBMin) : BigNumber.from(amountAMin),
              amountETHMin: tokenA === WETH ? BigNumber.from(amountAMin) : BigNumber.from(amountBMin),
              addressTo: ethers.utils.getAddress(safeAddress),
              deadline: Math.floor(Date.now() / 1000) + 60 * 20,
            },
          },
          UniswapV2Router02,
          tokenA === WETH ? BigNumber.from(amountADesired) : BigNumber.from(amountBDesired)
        )
      }
    } catch (err) {
      console.log("err", err)
    }
  }

  /* Handle setting token values and retrieving liquidity pair information  */
  const handleSetTokenValue = async (e, token, tokenRef) => {
    try {
      const bal = token?.balance
      const dec = token?.decimals
      const max = bal / 10 ** dec
      const token0 = Object.entries(uniswapTokens).filter(item => item[0] === token?.symbol)[0][1]
      const token0Input = e?.target?.valueAsNumber
      const route = new Route([pair], uniswapTokens[token?.symbol])
      const midPrice = route.midPrice.toSignificant(6)
      const token1 = Object.entries(uniswapTokens).filter(item => item[0] !== token?.symbol)[0][1]
      const token1Input = Number(token0Input * midPrice)
      const pairToken = lpToken0?.symbol === token?.symbol ? lpToken1 : lpToken0

      /*  If User attempts to LP more than balance, default to max balance */
      if (token0Input > max) {
        handleSetMaxTokenValue(token, tokenRef)
      } else {
        setState(state => ({ ...state, [token?.symbol]: token0Input }))
        setState(state => ({ ...state, [token1?.symbol]: token1Input }))
        setMaxError("")

        if (!isNaN(token0Input) && !isNaN(token1Input) && token0Input > 0 && token1Input > 0) {
          const liquidityInfo = await getLiquidityPairInfo({
            pair: pair,
            token0: token0,
            token0Input: token0Input,
            token0ETHConversion: token.ethValue,
            token1: token1,
            token1Input: token1Input,
            token1ETHConversion: pairToken.ethValue,
            abi: IUniswapV2ERC20.abi,
          })
          setLiquidityInfo(liquidityInfo)
        }
      }
    } catch (err) {
      console.log("err", err)
    }
  }

  /* Handle setting max token values and retrieving liquidity pair information  */
  const handleSetMaxTokenValue = async (token, tokenRef) => {
    try {
      const token0 = uniswapTokens[token?.symbol]
      const token0Input = tokenRef?.current?.max
      const pairToken = lpToken0?.symbol === token?.symbol ? lpToken1 : lpToken0
      const route = new Route([pair], uniswapTokens[token?.symbol])
      const midPrice = route.midPrice.toSignificant(6)
      const token1 = Object.entries(uniswapTokens).filter(item => item[0] !== token?.symbol)[0][1]
      const token1Input = token0Input * midPrice

      if (parseInt(token?.fiatBalance) > parseInt(pairToken?.fiatBalance)) {
        setMaxError(`Insufficient ${pairToken?.symbol} balance`)
        setState(state => ({ ...state, [token?.symbol]: 0 }))
        setState(state => ({ ...state, [token1.symbol]: 0 }))
        setLiquidityInfo({})
      } else {
        setState(state => ({ ...state, [token?.symbol]: token0Input }))
        setState(state => ({ ...state, [token1.symbol]: token1Input }))
        setMaxError("")

        const liquidityInfo = await getLiquidityPairInfo({
          pair: pair,
          token0: token0,
          token0Input: token0Input,
          token0ETHConversion: token.ethValue,
          token1: token1,
          token1Input: token1Input,
          token1ETHConversion: pairToken.ethValue,
          abi: IUniswapV2ERC20.abi,
        })
        setLiquidityInfo(liquidityInfo)
      }
    } catch (err) {
      console.log("err", err)
    }
  }

  /* Initialize state of inputs and initialize Uniswap Pair */
  const init = async () => {
    try {
      setState(state => ({ ...state, [lpToken0?.symbol]: 0 }))
      setState(state => ({ ...state, [lpToken1?.symbol]: 0 }))
      const uniPair = await Fetcher.fetchPairData(
        uniswapTokens[lpToken0?.symbol],
        uniswapTokens[lpToken1?.symbol]
      )
      await setPair(uniPair)
    } catch (err) {
      console.log("err", err)
    }
  }
  React.useEffect(() => {
    init()
  }, [])

  return (
    <ControlledModal close={closeUniswapLpModal} heading={"Add Liquidity"}>
      <div className="mt-2 rounded-xl bg-[#eda67e24] p-4 font-thin text-[#FC8D4D]">
        <span className="font-bold">Tip:</span> When you add liquidity, you will receive pool tokens representing your
        position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at
        any time.
      </div>
      <form className="flex w-full flex-col space-y-8 py-4" onSubmit={e => handleSubmit(e, liquidityInfo)}>
        <TokenInput
          pair={pair}
          tokenInputRef={token0InputRef}
          lpToken={lpToken0}
          handleSetTokenValue={handleSetTokenValue}
          handleSetMaxTokenValue={handleSetMaxTokenValue}
          readableTokenBalance={readableTokenBalance}
          state={state}
          logo={token0Logo}
        />
        <TokenInput
          pair={pair}
          tokenInputRef={token1InputRef}
          lpToken={lpToken1}
          handleSetTokenValue={handleSetTokenValue}
          handleSetMaxTokenValue={handleSetMaxTokenValue}
          readableTokenBalance={readableTokenBalance}
          state={state}
          logo={token1Logo}
        />
        <div className="mb-8 w-full">
          {liquidityInfo && (
            <PoolInfo
              spender={UniswapV2Router02}
              pair={pair?.liquidityToken}
              info={liquidityInfo}
              signer={signer}
              hasAllowance={hasAllowance}
              setHasAllowance={setHasAllowance}
              safeAddress={safeAddress}
            />
          )}
          {state[lpToken0?.symbol] > 0 && state[lpToken1?.symbol] > 0 && (
            <button
              className={`focus:shadow-outline mt-4 h-16 w-full appearance-none rounded-full 
              bg-sky-500 py-2 px-3 text-xl leading-tight hover:bg-sky-600 focus:outline-none ${
                supplyDisabled ? "border-slate-300" : "dark:bg-orange-600 hover:dark:bg-orange-700"
              }`}
              type="submit"
              disabled={supplyDisabled}
            >
              <div className={`${supplyDisabled ? "text-[#b9b9b9]" : "text-white"}`}>
                {maxError.length > 0 ? maxError : supplyDisabled ? "Token Approval Needed" : "Supply"}
              </div>
            </button>
          )}
        </div>
      </form>
    </ControlledModal>
  )
}

export default UniswapLpModal
