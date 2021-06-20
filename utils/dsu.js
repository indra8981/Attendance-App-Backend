const common_utils = require('./common_utils');
const constants = require('../service/constants');

class DSU {
  constructor(n) {
    this.parents = []
    for(let i = 0; i < n; i++) {  
      this.parents.push(i);
    }
  }
  find(x) {
    if(this.parents[x] != x)
      return this.parents[x] = this.find(this.parents[x]);
    return this.parents[x];
  }
  union(x, y) {
    var xpar = this.find(x);
    var ypar = this.find(y);
    if (xpar != ypar) {
      this.parents[ypar] = xpar;
      return false;
    } else {
      return true;
    }
  }
  console_print() {
    console.log(this.parents);
  }
}

function getClusterOfPresentStudents(allPresentUsers) {
  let n = allPresentUsers.length;
  var dsu = new DSU(n);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (
        common_utils.distance(
          allPresentUsers[i].latitude,
          allPresentUsers[i].longitude,
          allPresentUsers[j].latitude,
          allPresentUsers[j].longitude,
        ) <= constants.CLUSTER_RADIUS_IN_METRES
      ) {
        dsu.union(i, j);
      }
    }
  }

  var freqOfParents = [];
  for(let i = 0; i < n; i++) {
    freqOfParents.push(0);
  }
  for (let i = 0; i < n; i++) {
    freqOfParents[dsu.find(i)]++;
  }
  let mx = 0;
  for (let i = 0; i < n; i++) {
    mx = Math.max(mx, freqOfParents[i]);
  }
  let allValidClusterParents = [];
  for (let i = 0; i < n; i++) {
    if (freqOfParents[i] == mx) {
      allValidClusterParents.push(i);
    }
  }
  let clusterOfPresentStudents = [];
  for (let i = 0; i < n; i++) {
    if (allValidClusterParents.includes(dsu.find(i)))
      clusterOfPresentStudents.push(allPresentUsers[i]);
  }

  return clusterOfPresentStudents;
}

module.exports = {getClusterOfPresentStudents};