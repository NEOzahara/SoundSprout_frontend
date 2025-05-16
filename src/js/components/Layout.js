import React from 'react'
import { NavLink } from 'react-router-dom';
import { Outlet, useLocation } from 'react-router-dom';
import { ReactComponent as Logo } from '../../images/logo.svg'
import TopIcons from './TopIcons'
import Menu from './Menu'
import RightScroll from './RightScroll'
import PlayerBar from './PlayerBar'
import '../../css/Common.css'
//import HomePage from "../../HomePage";

export default function Layout() {

    // opcional: derivar o título da página da rota atual
    const { pathname } = useLocation();
    const titleMap = {
        '/':           'Home',
        '/explore':    'Explore',
        // '/following': 'Following',
        '/player':    'Player',
        // ...
    };
    const title = titleMap[pathname] || '';

    return (
        <div className="background">
            <Logo className="logo" />

            {/* icones topo */}
            <TopIcons />

            {/* menu esquerdo */}
            <Menu />

            {/* painel direito (cardLists) */}
            <RightScroll />

            {/* área central com header comum */}
            <div className="contentArea">
                <div className="pageHeader">
                    <h1>{title}</h1>
                </div>
                <div className="centerWrapper">
                    {/* é aqui que o HomePage ou ExplorePage aparece */}
                    <Outlet />
                </div>
            </div>

            {/* player fixo em baixo */}
            <PlayerBar />
        </div>
    )
}
//export default Layout;