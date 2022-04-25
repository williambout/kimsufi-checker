const request = require('request');
const _ = require('lodash');
const simplepush = require('simplepush-notifications');
require('dotenv').config()

var requests = 0;

const time = 10;
const country = "FR";
const servers = [process.env.KIMSUFI];

call();

function call(){
  requests++;
  process.stdout.clearLine();
  process.stdout.write(`Requests: ${requests}. Checking for ${servers.join(', ')} ...\r`);
  request(`https://www.ovh.com/engine/api/dedicated/server/availabilities?country=${country}`, { json: true }, (err, _res, body) => {
    if (err) console.error(err);
    const nodes = _.filter(body, (item)=>{
      return servers.includes(item.hardware);
    });
    nodeDatacenters = _.map(nodes, (node) => [node.hardware, node.datacenters]);
    availables = _.filter(nodeDatacenters, (node) => {
      return _.filter(node[1], (datacenter)=>{
        return datacenter.availability != 'unavailable';
      }).length > 0
    });
    if (availables[0]) {
      const url = `https://www.kimsufi.com/en/order/kimsufi.xml?reference=${availables[0][0]}`;
      simplepush.send({key: process.env.SIMPLEPUSH, title: 'Kimsufi available', message: url});
      return;
    }
    process.stdout.clearLine();
    process.stdout.write(`Requests: ${requests}. Not available. Waiting ${time} seconds...\r`);
    setTimeout(call, time * 1000);
  });
};

function printCountries() {
  request(`https://api.ovh.com/1.0/dedicated/server.json`, { json: true }, (_err, _res, body) => {
    const countries = body.models['nichandle.OvhSubsidiaryEnum'].enum.join(', ');
    process.stdout.write(`Available countries: ${countries}\n`);
  });
}
