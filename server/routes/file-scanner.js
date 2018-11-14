'use strict'
const express = require('express');
const router = express.Router();
const driveLetters = require('windows-drive-letters');
const app = express();
const { promisify } = require('util');
const { readdir, stat } = require('fs');
const fs = require('fs');

const readdirP = promisify(readdir)
const statP = promisify(stat)

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

// getting names of mount drives
app.get('/', (req, res, ) => {
  const letters = driveLetters.usedLettersSync();
  res.json(letters); 
});

// getting filelist of choosed directory
app.post('/files', (req, res) => {
  try {
    fs.readdir(req.body.choosed, (err, list) => {
      console.log(err);      
      if (err && err.code === 'ENOTDIR') {       
        console.log('It is not a dir');        
      } else if(err && err.code === 'ENOENT'){
        console.log('No such file or directory');
      } else {        
        res.json(list);               
      }
  });
  } catch (error) {
    console.log(error)
  }  




});

// getting stats from files 
 app.post('/stats', async (req, res)=> {   
    let listOfFiles = [];
    let sizes = [];
  const checkFiles = async (dir, filelist=[]) => {
    let files;
    try {
      files = await readdirP(dir);
    } catch (error) {
      console.log(error)
    }
    let result;

    try {
      result = files.map(async (fileName,i) => {
        const path = dir +'/'+ fileName;
        let stat;
        let fileSize;
        try {
          stat = await statP(path);
        } 
        catch (error) {
          //console.log(error);         
        } 

        try {
          if (stat.isDirectory()) {
            filelist = await checkFiles(path, filelist);
          } else {           
          listOfFiles.push(path);
            }
        } 
        catch (error) {
          console.log(error);
        }

        try {
          fileSize = await stat.size / 1000000.0;         
        if (fileSize === 0 || fileSize === undefined){          
        } else {
          sizes.push(fileSize);          
          }          
        } 
        catch (error) {
          console.log(error);
        }        
    });

    } catch (error) {
      console.log(error);
    }
    
             
        return await result
    }
  
    await checkFiles(req.body.choosed)  
  
    res.json(sizes);
  



  
  });
 

module.exports = app;