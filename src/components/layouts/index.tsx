import { Layout, LayoutProps } from "antd";
import { Content } from "antd/lib/layout/layout";
import HeaderLayout from "./HeaderLayout";

const DefaultLayout: React.FC<LayoutProps> = ({children})=>{
    return <Layout>
        <HeaderLayout/>
        <Content>
            {children}
        </Content>
    </Layout>
}

export default DefaultLayout