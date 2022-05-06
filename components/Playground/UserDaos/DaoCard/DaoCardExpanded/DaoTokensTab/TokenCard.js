import React from "react"
import { FaEthereum } from "react-icons/fa"
import { useDaoStore } from "stores/useDaoStore"
import { isEmpty } from "utils/helpers"

const TokenCard = ({ token }) => {
  const setUniswapSwapModalOpen = useDaoStore(state => state.setUniswapSwapModalOpen)
  const setUniswapLpModalOpen = useDaoStore(state => state.setUniswapLpModalOpen)
  const lpToken0 = useDaoStore(state => state.lpToken0)
  const setLpToken0 = useDaoStore(state => state.setLpToken0)
  const lpToken1 = useDaoStore(state => state.lpToken1)
  const setLpToken1 = useDaoStore(state => state.setLpToken1)
  const isActive = lpToken0?.tokenAddress === token?.tokenAddress || lpToken1?.tokenAddress === token?.tokenAddress
  const setLpToken = () => {
    if (!isActive) {
      if (Object.keys(lpToken0).length === 0) {
        setLpToken0(token)
      }
      if (
        Object.keys(lpToken1).length === 0 &&
        Object.keys(lpToken0).length !== 0 &&
        token.tokenAddress !== lpToken0.tokenAddress
      ) {
        setLpToken1(token)
        setUniswapLpModalOpen(true)
      }
    } else {
      setLpToken0({})
    }
  }

  const setSwapToken = () => {
    console.log("setSwapToken", token)
    setUniswapSwapModalOpen(true)
  }

  return (
    <div
      className="flex w-full flex-row justify-between rounded-xl bg-slate-100 p-2 dark:bg-slate-700 xl:flex-col"
    >
      <div className="flex w-full flex-row space-x-2">
        <div className="flex h-10 w-10 items-center justify-center overflow-clip rounded-full border border-white">
          {token?.token?.logoUri ? <img src={token?.token?.logoUri} alt={""} /> : <FaEthereum size={30} />}
        </div>
        <div className="flex h-full flex-col rounded-xl bg-slate-200 p-1 text-xs dark:bg-slate-600">
          <span>
            {(token?.balance / 10 ** 18).toFixed(3)} {token.token?.symbol ? token.token.symbol : "ETH"}
          </span>
          <span className="text-teal-600 dark:text-teal-400">${Number(token?.fiatBalance).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-row space-x-2 xl:justify-center p-1">
        {isEmpty(lpToken0) && (
          <>
            <button
              className="w-12 rounded-lg bg-blue-400 p-1 text-sm hover:bg-blue-500"
              onClick={() => console.log("hii")}
            >
              send
            </button>
            <button className="w-12 rounded-lg bg-blue-400 p-1 text-sm hover:bg-blue-500" onClick={setSwapToken}>
              swap
            </button>
          </>
        )}
        <button className="w-12 rounded-lg bg-blue-400 p-1 text-sm hover:bg-blue-500" onClick={setLpToken}>
          {isEmpty(lpToken0) && isEmpty(lpToken1) ? "LP" : isActive ? "Selected" : "Pair"}
        </button>
      </div>
    </div>
  )
}

export default TokenCard
