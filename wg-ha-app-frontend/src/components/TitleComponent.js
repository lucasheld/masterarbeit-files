import {Helmet, HelmetProvider} from "react-helmet-async";

const TitleComponent = ({title}) => {
    return (
        <HelmetProvider>
            <Helmet>
                <title>{title}</title>
            </Helmet>
        </HelmetProvider>
    );
};

export default TitleComponent;
