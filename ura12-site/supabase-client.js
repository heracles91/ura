// Supabase client + Admin API wrapper
(function () {
  var SUPABASE_URL      = 'https://doqnzmneiczjcjratlrn.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvcW56bW5laWN6amNqcmF0bHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzUyNjAsImV4cCI6MjA5MDAxMTI2MH0.c5x9Cs57PCZlzzQxsiFRmhP0xKLF6hRovICNeYG2xls';

  window._supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Admin API — wraps edge function calls
  window._admin = {
    _pwd: function() { return sessionStorage.getItem('ura12_admin_pwd'); },
    isLoggedIn: function() { return !!this._pwd(); },
    logout: function() { sessionStorage.removeItem('ura12_admin_pwd'); },

    verify: async function(password) {
      var res = await window._supa.functions.invoke('admin', {
        body: { action: 'login', password: password }
      });
      if (res.error || !res.data || !res.data.valid) return false;
      sessionStorage.setItem('ura12_admin_pwd', password);
      return true;
    },

    _invoke: async function(body) {
      return window._supa.functions.invoke('admin', {
        body: Object.assign({}, body, { password: this._pwd() })
      });
    },

    create: function(table, data) {
      return this._invoke({ action: 'create', table: table, data: data });
    },
    update: function(table, id, data) {
      return this._invoke({ action: 'update', table: table, id: id, data: data });
    },
    delete: function(table, id) {
      return this._invoke({ action: 'delete', table: table, id: id });
    },

    // Upload image to archive-images bucket, return public URL
    uploadImage: async function(file) {
      var ext      = file.name.split('.').pop();
      var fileName = 'archive-' + Date.now() + '.' + ext;
      var uploadRes = await window._supa.storage
        .from('archive-images')
        .upload(fileName, file, { contentType: file.type, upsert: true });
      if (uploadRes.error) return { error: uploadRes.error };
      var publicRes = window._supa.storage
        .from('archive-images')
        .getPublicUrl(uploadRes.data.path);
      return { url: publicRes.data.publicUrl };
    },
  };
})();
