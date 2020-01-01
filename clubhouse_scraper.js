const puppeteer = require('puppeteer');
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('https://www.campusvibe.ca/campusvibe/groups/cea260f5-8aab-4e11-bccf-fe4a846e62dc#grouptype=4ae737753cd77c806877fb9a848e144e64eb6275');
  await page.waitFor(2000);
  await page.click("#btn-list-view");
  await page.waitFor(2000);
  
  let clubsList = [];

  page.on('response', res => {
      if (res.url().includes('group?sname')) {
          res.json()
          .then(body => {
            for (let i = 0; i < 10; i++) {
               let info = body.listT[i];
               let club = {
                   name: info.name,
                   nickname: info.nickName,
                   description: info.description,
                   category: info.groupCategory,
                   campus: info.campusName,
                   faculty: info.programType,
                   targetMemberCategory: info.whoShouldJoin,
                   memberCount: info.memberCount,
                   nationalAffiliationName: info.nationalAffiliationName,
                   nationalAffiliationWebsite: info.nationalAffiliationWebsite,
                   notificationEmail: info.notificationEmail,
                   instagramLink: info.instagramLink,
                   twitterLink: info.twitterLink,
                   facebookLink: info.facebookLink,
                   imgLink: (info.imageId == '')? '' :  `https://www.campusvibe.ca/Skeddy/rest/gem/v1/image/${info.imageId}`
               }
               clubsList.push(club);
            }
          })
          .catch(err => {
            console.error(err);
          })
      } 
      
  });
 

  let totalClubsNum = await page.evaluate(() => {
    let totalClubs = document.querySelector("span.events-totalNumber");
    return Promise.resolve(totalClubs.firstChild.textContent);
    
  });

  let curNum = 0;

  while (curNum < totalClubsNum) {
    curNum = await scroll(page);
    await page.waitFor(500);
  }


  fs.writeFile("./clubs.json", JSON.stringify(clubsList, null, 2), (err) => {
    if (err) {
        console.error(err);
        return;
    };
  });

  await browser.close();
})();

async function scroll(page) {
    return page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
        window.scrollBy(0, -10);
        let count = document.querySelectorAll("#itemsListTable tr");
        return Promise.resolve(count.length);
    });
}




// // limited scrape info from dom after load
// async function getData(page) {
//     return page.evaluate(() => {
//         let clubs = document.querySelectorAll('#itemsListTable tr');

//         let clubList = [];

//         if (clubs) {
//             for (let club of clubs) {
//                 let imgDiv = club.cells[0].firstElementChild;
//                 let imgDivCss = window.getComputedStyle(imgDiv);
//                 let imgUrl = imgDivCss['background-image'].substring(5);
//                 imgUrl = imgUrl.split('")')[0]; 
     
//                 let itemDataDiv = imgDiv.nextElementSibling;
//                 let groupTitleH4 = itemDataDiv.firstElementChild;
//                 let name = groupTitleH4.firstElementChild.title;
        
//                 let groupTypeP = groupTitleH4.nextElementSibling;
//                 let potentialFaculty = groupTypeP.querySelector("a");
//                 let groupType = (potentialFaculty)? groupTypeP.lastElementChild.textContent : null;
             
//                 let targetP = groupTypeP.nextElementSibling;
//                 let target = targetP.title.substring(4);
              
//                 let shortDescription = targetP.nextElementSibling.textContent;
               
//                 let numMembers = club.cells[1].children[1].textContent;
             
//                 let clubInfo = {
//                     name: name,
//                     numMembers: numMembers,
//                     targetMemberType: target,
//                     faculty: groupType,
//                     truncatedDescription: shortDescription,
//                     imgUrl: imgUrl
//                 }    

//                 clubList.push(clubInfo);
                
//             }
//             return Promise.resolve(clubList);
//         } else {
//             Promise.reject(new Error('no clubs list found'));
//         }
//     });
// }
