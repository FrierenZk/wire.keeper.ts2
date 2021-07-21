import {Sidebar} from "./ui/sidebar";

document.getElementById('tail_script')?.remove()

let shadow = document.createElement('div')
shadow.className = 'w-100 border-bottom top-shadow'
document.body.appendChild(shadow)

let main = document.createElement('main')
main.className = 'flex-row'
document.body.appendChild(main)

let sideBar = document.createElement('div')
sideBar.className = 'side-bar mh-100 bg-white flex-column'
main.appendChild(sideBar)
sideBar.appendChild(new Sidebar().createFragment())
