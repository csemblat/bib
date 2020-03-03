const partial_page_url = "https://www.maitresrestaurateurs.fr/profil/" //concatenated with a number you get the page of the restaurant you want
const axios = require('axios');
const cheerio = require('cheerio');
const fs =  require('fs');


var scrapePage = async url => {
  const response = await axios(url);
  const {data, status} = response;

  if (status >= 200 && status < 300) {
    return data;
  }
  console.error(status);
  return null;
};

var Get_item = (data, balise_type, item) => { //gets item list from a data, and from specific balise_type
const $ = cheerio.load(data);
var item_array =[]; 
const url_list = $(balise_type).each(function(i,element) {
	var temp = $(this).attr(item);
	item_array.push(temp);
});
return item_array;
};

var Get_text = (data, balise_type) => { //gets item list from a data, and from specific balise_type
const $ = cheerio.load(data);
var item_array =[]; 
const url_list = $(balise_type).each(function(i,element) {
	var temp = $(this).text();
	item_array.push(temp);
});
return item_array;
};

function Get_Maitre_Info(data){
	var liste_adresse = Get_text(data, "div.profil-tooltip-action");
	var liste_names = Get_text(data, "span > strong");
	var liste_tel = Get_text(data, "div.section-item-right text flex-5")
	var rest_info = {name : liste_names[0], adress : liste_adresse[0], tel :  liste_tel[0]};
	return rest_info;
}
async function GetAllMaitreUrls(n){ //modified version of GetAllBibUrls
	var total_array = [];
	var i = 1;
	for(i = 1; i < n; i++) //we increment up to an arbitrary number so that you can modulate the runtime of the algorithm
	{
		var page_num = i.toString();
		var page_url = partial_page_url + page_num;
		//console.log(page_num);//debug line
		//console.log(page_url);
		var promise = scrapePage(page_url);
		var array = [];
		total_array.push(page_url);
	}
	return total_array;
}

async function Get_All_Maitre()
{
	var liste_resultat = [];
	var url_list = await GetAllMaitreUrls(1500)
	for(let i = 1; i < url_list.length; i++)
	{
		var full_url = url_list[i];
		var promise = scrapePage(full_url);
		var data = await promise;
		var temp = Get_Maitre_Info(data);
		liste_resultat.push(temp);
	}
	return liste_resultat;
}

function write_to_JSON(){
liste_2 = Get_All_Maitre();
//console.log(liste_2)
liste_2.then(function(result){
	console.log(result);
	var resultats = JSON.stringify(result);
	console.log(resultats); //debug line
	fs.writeFile('maitre_result.json', resultats);
})
return null;
}
var promise = Get_All_Maitre();
console.log(promise);
promise.then(function(result){
	console.log(result);
})