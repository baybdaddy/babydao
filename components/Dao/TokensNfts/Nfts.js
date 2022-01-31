import React from "react"
import { useOsStore } from "stores/useOsStore"

const Nfts = ({ collectibles }) => {
  console.log("Nfts", collectibles)
  const setOsSellModalOpen = useOsStore(state => state.setOsSellModalOpen)

  return (
    <div>
      <h1>Collectibles: {collectibles.length}</h1>
      <div className="grid grid-cols-2">
        {collectibles.map((nft, index) => (
          <div className="flex flex-col items-center">
            <img className="p-3" key={index} src={nft.imageUri} alt="" />
            <button
              className="w-1/2 rounded bg-slate-200 p-3 shadow dark:bg-slate-800"
              onClick={setOsSellModalOpen}
            >
              sell
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Nfts
