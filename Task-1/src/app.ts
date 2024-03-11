import express, { Application } from 'express';
import { router } from "./routes/";
import * as bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';

const App = () => {
    let app: Application = express();
    app.use(helmet());
    app.use(compression());

    app.use(bodyParser.urlencoded({
        extended: true, limit: '35mb',
        parameterLimit: 50000,
    }));
    app.use(bodyParser.json());
    app.use("/api", router);
    app.listen(8081, function () {
        console.log('listening on port 8081.');
    });
    return app;
};

App()
