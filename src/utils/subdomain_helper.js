const domainLength = parseInt(process.env.VUE_APP_DOMAIN_LENGTH); // route1.example.com => domain length = 3

// redirect with auth if the subdomain is wrong
export function redirectWithSubdomain(subdomain) {
  const host = window.location.host;
  const parts = host.split('.');

  if (parts.length === (domainLength - 1) || parts[0] === 'www' || parts[0] !== subdomain) {
    let redirect = window.location.protocol + '//' + subdomain;
    
    if (parts.length <= (domainLength - 1)) {
      // we don't have any subdomain
      redirect += '.' + host;
    } else {
      // we don't have a correct subdomain
      for (var i = 1; i < parts.length; i++) {
        redirect += '.' + parts[i];
      }
    }
    if (window.location.pathname !== '/login') {
      redirect += window.location.pathname;
    }
    
    //now adding the query part
    redirect += window.location.search;
    
    
    window.location.replace(redirect);
    return true;
  }
  return false;
}

// redirect without a subdoman
export function redirectWithNoSubdomain() {
  const host = window.location.host;
  const parts = host.split('.');

  if (parts.length === domainLength && parts[0] !== 'www') {
    let redirect = window.location.protocol + '//';
    
    for (var i = 1; i < parts.length; i++) {
      redirect += parts[i] + '.';
    }
    // removing the last '.'
    redirect = redirect.slice(0, -1);
    // adding the path
    redirect += window.location.pathname;
    
    //now adding the query part
    redirect += window.location.search;
    
    
    window.location.replace(redirect);
    return true;
  }
  return false;
}

// delete default .launch27.loc cookie
// vue-auth no able to delete the default on causing auth issues
export function deleteDefaultCookie(tokenName) {
  const host = window.location.hostname;
  const parts = host.split('.');
  let domain = host;

  if (parts.length === domainLength) {
    domain = parts[1] + '.' + parts[2];
  }
  document.cookie = tokenName + '=;Path=/;Domain=.' + domain + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export function setUrlSubdomain(Vue) {
    // set subdomain from the url
    const host = window.location.host;
    const parts = host.split('.');
    if (parts.length !== domainLength || parts[0] === 'www') {
        // we don't have a correct subdomain
        Vue.prototype.$subdomain.name = "default";
    } else {
        // we set the subdomain
        Vue.prototype.$subdomain.name = parts[0];
    }
}

export function getUrlSubdomain() {
    // set subdomain from the url
    const host = window.location.host;
    const parts = host.split('.');
    if (parts.length !== domainLength || parts[0] === 'www') {
        // we don't have a correct subdomain
        return "default";
    } else {
        return  parts[0];
    }
}