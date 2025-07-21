import React from 'react'
import { Outlet, useLocation } from 'react-router-dom';
import { ReactComponent as Logo } from '../../images/logo.svg'
import LogoPng from '../../images/Logo_background_removed.png'
import TopIconsLoggedOff from '../LoggedOffComponents/TopIconsLoggedOff'
import MenuLoggedOff from '../LoggedOffComponents/MenuLoggedOff'
import RightScrollLoggedOff from '../LoggedOffComponents/RightScrollLoggedOff'
import PlayerBarLoggedOff from '../LoggedOffComponents/PlayerBarLoggedOff'
import '../../css/Components/Common.css'
import '../../css/Components/CommonLoggedOff.css'

export default function LayoutLoggedOff() {

    // opcional: derivar o título da página da rota atual
    const { pathname } = useLocation();
    const titleMap = {
        '/homeLoggedOff':     'Home',
        '/exploreLoggedOff':    'Explore',
        //'/settings':    'Settings',
        // ...
    };
    // páginas onde NÃO queremos o título
    const hideTitleOn = ['/player'];
    const showTitle = !hideTitleOn.includes(pathname);

    const title = titleMap[pathname] || '';

    return (
        <div className="background">
            <img src={LogoPng} alt="Site Logo" className="logo" />
            {/*<Logo className="logo" />*/}

            {/* icones topo */}
            <TopIconsLoggedOff />

            {/* menu esquerdo */}
            <MenuLoggedOff />

            {/* painel direito (cardLists) */}
            <RightScrollLoggedOff />

            {/* área central com header comum */}
            <div className="contentArea">
                {showTitle && (
                    <div className="pageHeader">
                        <h1>{title}</h1>
                    </div>
                )}
                <div className="centerWrapper">
                    {/* é aqui que o HomePage ou ExplorePage aparece */}
                    <Outlet />
                </div>
            </div>

            {/* player fixo em baixo */}
            <PlayerBarLoggedOff />
        </div>
    )
}
//export default Layout;