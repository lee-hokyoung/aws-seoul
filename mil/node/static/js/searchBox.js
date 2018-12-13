var searchBox = $("#searchText");
if(searchBox.length){
    searchBox.autocomplete({
        source: function( request, response ) {
            $.post("/searchBox",{"query": request.term}, function(data){
                // console.log(data);
                var result = data.map(function(item){
                    var type = (typeof(item['@type'])==='string')?item['@type'].replace(_resource, '').replace(/\[dot\]/g, '.'):item['@type'][0].replace(_resource, '').replace(/\[dot\]/g, '.');
                    var value = (item.hasOwnProperty(_label))?((item[_label].hasOwnProperty('@value'))?item[_label]['@value'].replace(_resource, '').replace(/\[dot\]/g, '.'):item[_label].replace(_resource, '').replace(/\[dot\]/g, '.')):item['@id'].replace(_resource, '');
                    // console.log('value : ', value);
                    return {'@id':item['@id'].replace(/\[dot\]/g, '.'),
                        '@type':type,
                        'label':value + ' (' + type + ')',
                        'value':value
                    }
                });
                response(result);
            });
        },
        select: function(ev,data){
            console.log('data : ', data);
            if(ev.keyCode === 13){
                var params = {};
                params["@searchable"] = data.item['value'];
                postFormToUri(params,"/sitemap");
            }else{
                document.location = data.item['@id'];
            }
        }
    });
    searchBox.keypress(function(event) {
        if (event.keyCode === 13) {
            var params = {};
            params["@searchable"] = this.value;
            postFormToUri(params,"/sitemap");
        }else{

        }
    });
}

function postFormToUri(params,uri) {
    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", uri);
    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", typeof params[key] == 'object' ? JSON.stringify(params[key]) : params[key]);
            form.appendChild(hiddenField);
        }
    }
    document.body.appendChild(form);
    form.submit();
}