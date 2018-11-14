import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

 class App extends React.Component {
   
  constructor(props) {
    super(props);
    this.state = {
      drives: [],
      path: [],
      files: [],
      prevPath: [],
      sizes:[],
      less10MB: 0,
      from10to50MB: 0,
      morethan100MB: 0
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleClickDirs = this.handleClickDirs.bind(this);
    this.backSpaceButton = this.backSpaceButton.bind(this);
    this.sizeChart = this.sizeChart.bind(this);

  };

  componentDidMount() {
    axios.get("/scanner")
      .then(res => {this.setState({
        drives: res.data              
        });
      });       
  };

handleClick(key){  
  key.preventDefault();
  let choosed;
  if (key.target.firstChild.innerHTML === undefined) {
    choosed = key.target.innerHTML + ":/";
  } else {
    choosed = key.target.firstChild.innerHTML + ":/";
  } 
  if (this.state.path.length > 0 ) {    
    let newPath = this.state.path.splice(0);    
    this.setState({
      path: newPath
    })
  }

  this.setState({    
    path: this.state.path.concat(choosed)
  })   
   
  axios.post('/scanner/files', {choosed})
    .then(res => {        
        this.setState({
        files: res.data
    });    
  });  

 axios.post("/scanner/stats", {choosed})
    .then(res => {      
      this.setState({sizes: res.data}, function () {
        this.sizeChart()
      });
    });  
};


 handleClickDirs(key) {   
  key.preventDefault();
  let clicked;
  if (key.target.firstChild.innerHTML === undefined) {
    clicked = key.target.innerHTML + "/";
  } else {
    clicked = key.target.firstChild.innerHTML + "/";
  }
  
  let newPathArr = this.state.path.concat(clicked);
   
    axios.post("/scanner/stats", {choosed: newPathArr.join('')})
    .then(res => {    
      this.setState({sizes: res.data}, function () {
        this.sizeChart()
      });
    }) 
     
    axios.post('/scanner/files', {choosed: newPathArr.join('')})
      .then(response => { 
        this.setState({
        files: response.data,
        path: newPathArr
      })    
    })
    .catch(err => {
        console.log(err.status)
    });   
 };

async sizeChart(){  
  let less10MB = 0;
  let from10to50MB= 0;
  let morethan100MB= 0;
  const count = async (arr) => {
    let result = arr.map(async (el) => {
      if (el < 10) {        
        less10MB = less10MB + 1;
      } else if (el >= 10 && el <= 50){
        from10to50MB = from10to50MB + 1;
      } else if (el >=100) {
        morethan100MB = morethan100MB + 1;
      }
    })
    return Promise.all(result)
  }
  await count (this.state.sizes)  
  this.setState({
    less10MB: less10MB,
    from10to50MB: from10to50MB,
    morethan100MB: morethan100MB
  })
} 

 backSpaceButton(){     
  let choosed = this.state.path.slice(0, -1);
  if (choosed.length > 0 ){

    axios.post('/scanner/files', {choosed: choosed.join('')})
    .then(res => {this.setState({
      files: res.data,
      path: choosed
      });
    }); 

    axios.post("/scanner/stats", {choosed: choosed.join('')})
    .then(res => {    
      this.setState({sizes: res.data}, function () {
        this.sizeChart()
        });
      }) 
  }
 };

  render() {
    let driveList = this.state.drives.map(function(e, id){
      return (<li type='none' key={id}><a href={e}>{e}</a></li>)        
    });

    let filesList = this.state.files.map(function (e, id){
      return(<li type='none' key={id}><a href={e}>{e}</a></li>)
    });    
  
    return (
      <div className="container">
        <div>
          <span>Current path: {this.state.path}</span>
          </div>
        <div className = "row">
          <div className="col-md"><h1>Choose drive:</h1></div>
          <div className="col-md-9">
          <button type="button" className="btn btn-primary" onClick={() => {this.backSpaceButton(); this.sizeChart();}} >Return</button>
          </div>       
        </div>        
       <div className = "row">
        <div className="col-md">
          <ul className='driveLetter' onClick={(e) => {this.handleClick(e); this.sizeChart();}} >{driveList}</ul>
        </div>
       </div>

       <div>
        <div className ="col-md">
          <table className = "table-bordered">
          <caption>Count of files in directory</caption>
            <thead >
              <tr>
                <th >Less 10MB</th>
                <th>From 10 to 50MB</th>
                <th>More than 100MB</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{this.state.less10MB}</td>
                <td>{this.state.from10to50MB}</td>
                <td>{this.state.morethan100MB}</td>
              </tr>
            </tbody>
          </table>
        </div>
       </div>        
        <div id='files'>
          <ul onClick={(e) => {this.handleClickDirs(e); this.sizeChart();}}>{filesList}</ul>
        </div>        
      </div>
    );
  }
}

export default App;


