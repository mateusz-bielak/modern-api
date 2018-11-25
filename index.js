const HapiSwagger = require('hapi-swagger');
const Inert = require('inert');
const Pack = require('./package');
const Vision = require('vision');
const hapi = require('hapi');
const mongoose = require('mongoose');
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi');

const schema = require('./graphql/schema');
const Painting = require('./models/Painting');

const server = hapi.server({
    port: 4000,
    host: 'localhost',
});

mongoose.connect('mongodb://admin:xHQCteBXbBbp4yS@ds115434.mlab.com:15434/modern-api');

mongoose.connection.once('open', () => console.log('connected to database'));

const init = async () => {
    await server.register([
        {
            plugin: graphqlHapi,
            options: {
                path: '/graphql',
                graphqlOptions: {
                    schema,
                },
                route: {
                    cors: true,
                },
            },
        },
        {
            plugin: graphiqlHapi,
            options: {
                path: '/graphiql',
                graphiqlOptions: {
                    endpointURL: '/graphql',
                },
                route: {
                    cors: true,
                },
            },
        },
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: 'Paintings API Documentation',
                    version: Pack.version,
                },
            },
        },
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: 'Paintings API documentation',
                    version: Pack.version,
                },
            },
        },
    ]);

    server.route([
        {
            method: 'GET',
            path: '/',
            handler: () => `<h1>My modern api</h1>`,
        },
        {
            method: 'GET',
            path: '/api/v1/paintings',
            config: {
                description: 'Get all the paintings',
                tags: ['api', 'v1', 'painting'],
            },
            handler: () => Painting.find(),
        },
        {
            method: 'POST',
            path: '/api/v1/paintings',
            config: {
                description: 'Add a new painting',
                tags: ['api', 'v1', 'painting'],
            },
            handler: req => {
                const { name, url, technique } = req.payload;
                const painting = new Painting({ name, url, technique });

                return painting.save();
            },
        },
    ]);

    await server.start();
    console.log(`Server runnint at: ${server.info.uri}`);
};

init();
