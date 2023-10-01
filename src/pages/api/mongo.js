// Import the necessary modules
const mongoose = require('mongoose');
const cron = require('node-cron');
const LineMongo = require('@/models/linedbModel');
const qs = require('qs');
const axios = require('axios');
var parser = require('cron-parser');

// export const runtime = 'edge';

export default async function handler(req, res)  {
   let message = await checkJob();
   res.status(200).json({ message: message })
}

async function checkJob() {
   
   // Connect to MongoDB Atlas
   const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_PATH}.l6zwp5c.mongodb.net/${process.env.MONGO_PATH}`
   
   mongoose.set("strictQuery", false);
   mongoose.connect(uri).then(async () => {

      const linedatas = await LineMongo.find({});
      console.log('CheckJob', uri, new Date())
      // For each cronjob, check if the condition is met
      for (const data of linedatas) {
         console.log(data)
         if (cron.validate(data.condition) && (checkAndRunJob(data.lastRun, data.condition, data.isActive))) {
            console.log('Send notify to', data.name)
            SendNotify(data.accesstoken, data.message)
            updateLastRun(data);
         }
      }

      return "Completed! on " + new Date()
   });
}

async function updateLastRun(data) {
   data.lastRun = new Date();
   if (!data.isRecurring) {
      data.isActive = false;
   }
   await data.save();
}

function checkAndRunJob(lastRun, condition, isActive) {
   if (!isActive)
      return false;

   try
   {
      var interval = parser.parseExpression(condition, {
         currentDate: lastRun,
         endDate: new Date(),
         iterator: true
      });
      var obj = interval.next();

      const shouldTrigger = obj.done < new Date()
      console.log('checkAndRunJob', shouldTrigger, lastRun, condition, isActive)
      return shouldTrigger;
   }
   catch {
      return false;
   }
}

function SendNotify(accesstoken, message) {
   let data = qs.stringify({
      'message': message
   });

   let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://notify-api.line.me/api/notify',
      headers: { 
        'Cache-Control': 'no-cache', 
        'Content-Type': 'application/x-www-form-urlencoded', 
        'Authorization': 'Bearer ' + accesstoken
      },
      data : data
    };
    
   axios.request(config)
    .then((response) => {
      console.log('complete', new Date(), JSON.stringify(response.data));
   }).catch((error) => {
      console.log(error);
   });
}