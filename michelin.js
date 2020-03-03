const bib_url = "https://guide.michelin.com/fr/fr/restaurants/bib-gourmand"; //url of the first page containing bib'd restaurant
const michelin_url = "https://guide.michelin.com" //concatenated with partial restaurant url you can get full restaurant url
const page_sub_url = "/page/"; //concatenated followed by the page number after bib_url to get pages ater the first one
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

/*axios.get('https://guide.michelin.com/fr/fr/restaurants/bib-gourmand').then((response) => { //example of a .then()
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
  })*/


function sleep(arbitrary_unit){ //waits an amount of time proportional to 300/clock_frequency (unused)
let variable = 0;
 for(let i = 0; i < (arbitrary_unit * 300); i++)
 {
	variable += 1;
 }
 return null;
}

var Get_url_list = data => { //gets url from bib_url
const $ = cheerio.load(data); //$("balise_name"."balise_class") selects the balises from the data of "$" with specific name and class
var url_array =[]; 
const url_list = $("a.link").each(function(i,element) { //usual way of iterating over a cheerio selector result is each(function(i,element))
	var temp = $(this).attr('href');
	url_array.push(temp);
});
return url_array;
}

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

var Bib_Restaurant_info = data => { //gets info of a restaurant from an html page and returns a json object
	var liste_names = Get_text(data, "h2.restaurant-details__heading--title");
	var liste_adresse = Get_text(data, "ul.restaurant-details__heading--list > li");
	var liste_tel = Get_text(data,"span.flex-fill");
	var rest_info = {name : liste_names[0], adress : liste_adresse[0], tel :  liste_tel[0]};
	return rest_info;
}

async function GetAllBibUrls(n){
	var total_array = [];
	var i = 1;
	for(i = 1; i < n; i++) //we increment up to an arbitrary number so that you can modulate the runtime of the algorithm
	{
		var page_num = i.toString();
		var page_url = bib_url + page_sub_url + page_num;
		//console.log(page_num);//debug line
		//console.log(page_url);
		var promise = scrapePage(page_url);
		var array = [];
		array = await promise;
		var array2 = Get_url_list(array);
		if(array2.length > 0){ //if page is empty then don't consider it
		total_array.push(array2);
		}
	}
	return total_array;
}

async function Get_All_Restaurant_json() //very long (at least a few hours) but should be very detailed
{
	resto_list = [];
	url_list_list = await GetAllBibUrls(2);
	console.log(url_list_list[0].length);
	for(let i = 0; i < url_list_list.length; i++)
	{
		for(let j = 0; j < url_list_list[i].length; j++)
		{
			var sub_url = url_list_list[i][j];
			var full_url = michelin_url + sub_url;
			var promise = scrapePage(full_url);
			var data = await promise;
			var resto = Bib_Restaurant_info(data);
			console.log(resto); //shows progress
			resto_list.push(resto);
		}
	}
	return resto_list;
}

async function Get_Restaurants_json_minimalist() //faster, less accurate version of Get_all_Restaurant_json
{
	//TODO
	resto_list = [];
	url_list_list = await GetAllBibUrls(30);
	
}


function write_to_JSON(){
liste_2 = Get_All_Restaurant_json();
console.log(liste_2)
liste_2.then(function(result){
	console.log(result);
	var bib_resultats = JSON.stringify(result);
	console.log(bib_resultats); //debug line
	fs.writeFile('bib_result.json', bib_resultats);
})
return null;
}
write_to_JSON();

module.exports.get = () => {
  return [];
};



