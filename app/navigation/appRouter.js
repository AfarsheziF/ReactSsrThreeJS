// Or Sarfati version 03.02.22

import React from "react";
import {
    Route,
    Routes,
    useNavigation,
    useNavigate,
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import SceneHolder from '../layouts/scene/sceneHolder';
import Admin from "../layouts/admin";

import utils from '../utils/utils';

const AppRouter = (props) => {
    const navigate = useNavigate();

    console.log("** App Router loaded **");
    console.log(props);

    //

    const getRoutes = route => {
        createBrowserRouter(
            createRoutesFromElements(
                <Routes>
                    <Route
                        // index
                        path="*"
                        element={
                            <SceneHolder
                                data={this.props.data}
                                onBack={this.onBack}
                                ref={ref => { this.sceneHolder = ref }}
                                initRoute={this.route}
                                updateRoutes={this.updateRoutes}
                                resetUrl={this.resetUrl}
                                onDebug={this.props.appState.onDebug}
                            />
                        }
                    />

                    <Route
                        path="admin"
                        element={<Admin setAppState={this.props.setAppState} navigateTo={this.navigateTo} />}
                    />
                    {/* <Route path="*" element={
                <div style={{ backgroundColor: 'white' }}>
                    <h1>ROUTE NOT MATCH</h1>
                </div>
            }
            /> */}
                </Routes >
            )
        )
    }

    const getManualRoutes = route => {
        switch (route) {
            case '/admin':
                return <Admin setAppState={this.props.setAppState} navigateTo={this.navigateTo} />

            case '/':
            default:
                return <SceneHolder
                    data={this.props.data}
                    onBack={this.onBack}
                    ref={ref => { this.sceneHolder = ref }}
                    initRoute={this.route}
                    updateRoutes={this.updateRoutes}
                    resetUrl={this.resetUrl}
                    onDebug={this.props.appState.onDebug}
                />;;
        }
    }

    // this.route = navigation.location.pathname;
    // console.log('AppRouter Render:', this.route);

    let basePrefix = props.envParams ? props.envParams.basePrefix : '';

    return (
        <Routes>
            <Route
                // index
                path="*"
                element={
                    <SceneHolder
                        onDebug={props.appState.onDebug}
                    />
                }
            />

            <Route
                path={basePrefix + "/admin"}
                element={<Admin setAppState={props.setAppState} />}
            />
        </Routes >
    )
}

export default AppRouter;