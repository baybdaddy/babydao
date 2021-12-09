import axios from "axios"

const api = axios.create({
  baseURL: "https://minidao.herokuapp.com/",
})

// get all users
export const getUsers = () => api.get("/accounts").then(res => res.data)

// update user
export const updateUser = req => {
  api.put("/accounts", req).then(res => {
    console.log("updateUser response:", res.data)
    return res.data
  })
}

// request relationship
export const reqRelationship = req => {
  api.post("/relationship/create", req).then(res => {
    console.log("reqRelationship response:", res.data)
    return res.data
  })
}
