import React from "react"
import Head from "next/head"
import UserImage from "./UserImage"
import UserDetails from "./UserDetails"
import UserFriends from "./UserFriends"
import UserBio from "./UserBio"
import CreateDaoPrompt from "./CreateDaoPrompt"
import UserDaos from "./UserDaos"
import DaoForm from "../Forms/DaoForm"
import { useUiStore } from "stores/useUiStore"
import { useConnect } from "wagmi"

const UserDashboard = ({ data }) => {
  const { id, address } = data.user
  const { safes } = data.safes
  const [{ data: connectData, error, loading }, connect] = useConnect()
  const createDaoModalOpen = useUiStore(state => state.createDaoModalOpen)

  console.log("UserDashboard user:", data.user)
  console.log("UserDashboard safes:", data.safes)
  console.log("UserDashboard useConnect:", connectData)

  return (
    <>
      <Head>
        <title>{`babydao | ${address.substring(0, 6)}...`}</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {data ? (
        <>
          {createDaoModalOpen ? <DaoForm address={address} /> : <></>}
          <div className="mt-5 flex h-full w-full flex-col pb-10 md:flex-row">
            <div className="flex-start flex flex-col px-4 md:w-3/12 md:px-10">
              <UserImage address={address} />
              <UserDetails id={id} address={address} />
              <UserFriends id={id} />
              <UserBio />
            </div>
            <div className="flex flex-col px-10 md:w-9/12">
              {safes.length ? (
                <UserDaos safes={data.safes} />
              ) : (
                <CreateDaoPrompt />
              )}
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  )
}

export default UserDashboard
