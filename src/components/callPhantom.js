/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

let Cu = Components.utils;
let Ci = Components.interfaces;
let Cc = Components.classes;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import('resource://slimerjs/slUtils.jsm');

function callPhantomAPI() {}

callPhantomAPI.prototype = {

    classID: Components.ID("{4e2fc2ea-f8b9-456b-a421-71039eb8dcd0}"),

    QueryInterface: XPCOMUtils.generateQI(
                                          [Ci.nsIDOMGlobalPropertyInitializer,
                                           Ci.nsISupports]
                                          ),

    init: function (aWindow) {
        let self = this;
        this.window = XPCNativeWrapper.unwrap(aWindow);
        this.webpage = getWebpageFromContentWindow(aWindow);
        return function() {
            var arg = (arguments.length?arguments[0]:null);
            if (!self.webpage) {
                dump("Error: no webpage found when calling callPhantom\n")
                return;
            }
            if (self.webpage.onCallback) {
                try {
                    let result = self.webpage.onCallback(arg);
                    if (typeof result == "object") {
                        let expose = {}
                        for (let p in result) {
                            expose[p] = 'rw';
                        }
                        result.__exposedProps__ = expose;
                    }
                    return result;
                }
                catch(e) {
                    if (typeof e == 'object') {
                        let expose = {
                            message:'r',
                            name:'r'
                        }
                        for (let p in e) {
                            expose[p] = 'r';
                        }
                        e.__exposedProps__ = expose;
                    }
                    throw e;
                }
            }
        }
    }
};

var NSGetFactory = XPCOMUtils.generateNSGetFactory([callPhantomAPI]);
