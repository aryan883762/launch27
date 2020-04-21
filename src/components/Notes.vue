<template>
  <div class="booking-account-notes">
    <el-row>
      <el-col>
        <el-row style="margin-bottom: 10px;">
          <el-col>
            <strong class="pull-left" style="margin-right: 10px;">
              Notes
            </strong>
          </el-col>
        </el-row>
      </el-col>

      <el-col>
        <div class="add-note-box">
          <el-form :model="form" :rules="rules" label-position="top" ref="person_note">
            <el-form-item class="add-note-box" prop="text">
              <el-input placeholder="Write your notes here" rows="5" type="textarea" v-model="form.text"/>
              <el-row>
                <el-col>
                  <el-upload
                    :action="$root.getFileUrl()"
                    :before-remove="beforeRemove"
                    :file-list="files"
                    :headers="$root.getHeaders()"
                    :limit="5"
                    :before-upload="beforeFileUpload"
                    :on-error="handleError"
                    :on-exceed="handleExceed"
                    :on-preview="handlePreview"
                    :on-remove="handleRemove"
                    :on-success="uploadFileSuccess" :show-file-list="false"
                    class="upload-btn"
                    multiple>
                    <el-button class="text-button" icon="el-icon-paperclip" size="mini" type="text"></el-button>
                  </el-upload>


                  <el-upload :action="$root.getFileUrl()" :before-remove="beforeRemove"
                             :file-list="images"
                             :headers="$root.getHeaders()"
                             :limit="5"
                             :before-upload="beforeImageUpload"
                             :on-error="handleError"
                             :on-exceed="handleExceed"
                             :on-preview="handlePreview"
                             :on-remove="handleRemove"
                             :on-success="uploadImageSuccess"
                             :show-file-list="false" class="upload-btn" multiple>
                    <el-button class="text-button" icon="el-icon-picture-outline" size="mini" type="text"></el-button>
                  </el-upload>

                  <div style="display: inline-block;">
                    <el-popover
                            placement="right"
                            title=""
                            width="400"
                            trigger="click">

                      <el-select :loading-text="'Loading members..' " placeholder="Add member(s)" :remote-method="getAccounts" size="mini" style="width: 100%" collapse-tags filterable multiple remote v-loading="loading" v-model="form.viewerIds">
                        <el-option :key="team.id" :label="team.name" :value="team.id" v-for="team in noteAccountObjs"/>
                      </el-select>
                      <el-button style="font-size: 18px" slot="reference" class="text-button" icon="el-icon-user-solid" size="large" type="text"></el-button>
                    </el-popover>
                  </div>
                </el-col>
              </el-row>

            </el-form-item>
          </el-form>
          <div v-if="note_file_loading" >uploading..</div>
          <div v-if="note_image_loading" >uploading..</div>
        </div>

        <el-row v-if="images.length > 0 || files.length > 0">
          <el-col>
            <el-card>
              <el-image :key="imgIndex" :src="img.url"  style="width:32px;height:32px;margin-right: 5px;" v-for="(img, imgIndex) in images"></el-image>
              <i class="el-icon-document" style="font-size: 39px;" v-for="file in files"></i>
            </el-card>
          </el-col>

        </el-row>

        <el-row>

          <el-col :md="8">
            <el-select :loading="loading" :remote-method="remoteMembersMethod" filterable multiple placeholder="Search members" remote reserve-keyword v-if="showMembers" v-model="memberData.memberValues">
              <el-option :key="member.id" :label="member.full_name" :value="member.id" v-for="member in memberData.memberOptions"></el-option>
            </el-select>
          </el-col>
        </el-row>

        <el-row>
          <el-button @click="addNote()" class="pull-right" round size="small" type="primary">Create Note</el-button>
        </el-row>
      </el-col>

      <el-dialog :close-on-press-escape="true" :title="'Select Booking'" :visible.sync="selectBookingDialog" @close="beforeCloseBookingDialog" append-to-body width="50%">
        <el-row>
          <el-select :loading="loading" :remote-method="remoteBookingsMethod" filterable multiple placeholder="Search members" remote reserve-keyword v-model="bookingData.bookingValues">
            <el-option :key="booking.id" :label="booking.full_name + ' - ' + booking.full_address" :value="booking.id" v-for="booking in bookingData.bookingOptions"></el-option>
          </el-select>
        </el-row>

        <div class="dialog-footer" slot="footer">
          <el-button @click="salesTaxDialog = false" size="small">Cancel</el-button>
          <el-button size="small" type="primary">Add</el-button>
        </div>
      </el-dialog>
    </el-row>

    <el-divider></el-divider>

    <el-card :key="noteIndex" shadow="never" v-for="(note, noteIndex) in notes">
      <el-row>
        <el-col class="wd-tab-notes-author">
          <div class="flex-row">
            <div style="width:calc(80%)">
              <el-avatar :size="32" :src="note.author.avatar" style="float:left;margin-right: 10px;" v-if="note.author.avatar"/>
              <avatar :size="32" :username="note.author.fullname" class="pull-left profile-avatar" style="margin-right: 10px;" color="white" v-if="!note.author.avatar"/>
              <div>
                <p>{{ note.author.fullname }}</p>
                <small>{{ note.author.roleName }}</small>
              </div>
            </div>
            <div>
              <p>{{ $moment(note.created_at).format($date_format) }}</p>
              <small>{{ $moment(note.created_at).format($time_format) }}</small>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-row class="wd-tab-notes-content">
        <el-col>
          <p>{{ note.text }}</p>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          <div class="note-meta" style="overflow: hidden;">
            <el-col :xs="24" :sm="12" :md="12" style="padding: 8px 0 0;">
              <el-tooltip class="item" effect="dark" :content="member.fullname" placement="bottom" v-for="(member, memberIndex) in note.viewers">
                <avatar :key="memberIndex" :size="25" :username="member.fullname" class="profile-avatar-stack" style="float:left;margin-right: 10px;"></avatar>
              </el-tooltip>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" style="padding: 15px 0 0">
              <el-popover
                      v-if="note.images.length > 0"
                      style="min-width: 80px"
                      placement="right"
                      trigger="click">
                <ul style="list-style: none; margin: 0; padding: 0">
                  <li v-for="(image, imgIndex) in note.images" style="display: inline-block"><a target="_blank" style="padding: 5px" :href="image" download><img style="vertical-align: middle" :src="image" alt="note image" height="20px" width="20px"></a></li>
                </ul>
                <span class="note-image" slot="reference"><i class="el-icon-picture"></i> {{note.images.length}} </span>
              </el-popover>
              <el-popover
                      v-if="note.files.length > 0"
                      style="min-width: 80px"
                      placement="right"
                      trigger="click">
                <ul style="list-style: none; margin: 0; padding: 0">
                  <li v-for="(file, flIndex) in note.files" style="display: inline-block"><a target="_blank" style="padding: 5px" :href="file" download><i class="el-icon-document"></i></a></li>
                </ul>
                <span class="note-files" slot="reference"><i class="el-icon-document"></i> {{note.files.length}} </span>
              </el-popover>
              <span v-if="note.images.length < 1" class="note-image"><i class="el-icon-picture"></i> {{note.images.length}} </span>
              <span v-if="note.files.length < 1" class="note-files">  <i class="el-icon-document"></i> {{note.files.length}}</span>
            </el-col>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
    import Avatar from 'vue-avatar'

    export default {
        components : {
          Avatar,
        },
        props: {
            accountId: {
                type: [String, Boolean],
                required: true
            },
            bookingId: [String, Boolean]
        },
        data() {
            return {
                filter: "",
                person: false,
                form: {
                    text: "",
                    images: [],
                    files: [],
                    viewerIds: []
                },
                files: [],
                images: [],
                loading: false,

                memberData: {
                    memberOptions: [],
                    memberList: [],
                    memberValues: [],
                    loadedMembers: []
                },
                bookingData: {
                    bookingOptions: [],
                    bookingList: [],
                    bookingValues: [],
                    loadedBookings: []
                },
                noteAccountObjs: [],
                assigned_teams: [],
                selectBookingDialog: false,
                showMembers: false,
                listNames: [],
                notes: [],
                note_file_loading: false,
                note_image_loading: false,
                rules: {
                    text: [{message: "Note text is required", required: true, trigger: 'blur'}]
                }
            };
        },

        watch: {
            accountId(val) {
                //trigger reloading of notes
                this.loadNotes();
            },
            bookingId(val) {
                //trigger reloading of notes
                this.loadNotes();
            }
        },
        mounted() {
            this.loadNotes();
            this.files = []
            this.images = []
        },

        methods: {
            getAccounts(query) {
                if(query.length >1){
                    this.loading = true;
                    this.axios
                        .get('/companies/current/accounts',{
                            params: {
                                filter: {
                                    where: {
                                        or: [
                                            {
                                                email: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                first_name: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                last_name: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            },
                                        ],
                                        id:{nin:[this.$auth.user().id]}
                                    }
                                }
                            }
                        })
                        .then(res => {
                            this.noteAccountObjs = res.data
                            console.log(res.data);
                        })
                        .catch(err => {
                        })
                        .then(() => {
                            this.loading = false
                        })
                }
            },
            beforeCloseBookingDialog() {
            },
            attachToBooking() {
                this.loadBookings();
                this.bookingValues = [];
                this.selectBookingDialog = true;
            },
            loadNotesEvent(person) {
                this.loadNotes();
            },
            toggleMembers() {
                if (this.memberData.memberValues.length <= 0) {
                    this.showMembers = !this.showMembers;
                }
            },

            loadMembers() {
                this.loading = true;
                this.axios
                    .get("/companies/current/accounts")
                    .then(res => {
                        this.memberData.loadedMembers = res.data.map(mem => {
                            return {id: mem.id, full_name: mem.fullname};
                        });
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false;
                    });
            },

            loadBookings() {
                this.loading = true;
                this.axios
                    .get("/companies/current/bookings", {params: {filter: {where: {accountId: this.accountId}}}})
                    .then(res => {
                        this.bookingData.loadedBookings = res.data.map(booking => {
                            return {id: booking.id, full_name: booking.account.fullname, full_address: booking.address.full_address};
                        });
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false;
                    });
            },

            remoteMembersMethod(query) {
                if (query !== "") {
                    this.loading = true;
                    setTimeout(() => {
                        this.loading = false;
                        this.memberData.memberOptions = this.memberData.loadedMembers.filter(item => {
                            return item.full_name.toLowerCase().indexOf(query.toLowerCase()) > -1;
                        });
                    }, 200);
                } else {
                    this.memberData.memberOptions = [];
                }
            },

            remoteBookingsMethod(query) {
                if (query !== "") {
                    this.loading = true;
                    setTimeout(() => {
                        this.loading = false;
                        this.bookingData.bookingOptions = this.bookingData.loadedBookings.filter(booking => {
                            return booking.full_name.toLowerCase().indexOf(query.toLowerCase()) > -1;
                        });
                    }, 200);
                } else {
                    this.memberData.memberOptions = [];
                }
            },

            addNote() {
                this.loading = true;

                this.$refs.person_note.validate(valid => {
                    if (valid) {
                        this.form.accountId = this.accountId;

                        this.images.forEach((img) => {
                            this.form.images.push(img.url)
                        })

                        this.files.forEach((file) => {
                            this.form.files.push(file.url)
                        })


                        if (this.bookingId) this.form.bookingId = this.bookingId;

                        this.axios
                            .post("/accounts/" + this.accountId + "/notes", this.form)
                            .then(res => {
                                this.loadNotes();
                                this.files = [];
                                this.images = [];
                                this.form.text = "";
                                this.form.images = [];
                                this.form.files = [];
                                this.form.viewerIds = [];
                            })
                            .catch()
                            .then(() => {
                                this.loading = false;
                            });
                    }
                });
            },

            loadNotes() {
                this.loading = true;
                this.files = []
                this.images = []

                if (this.accountId)
                    this.axios
                        .get("/accounts/" + this.accountId + "/notes", {
                            params: {
                                filter: {
                                    include: ['author', 'viewers']
                                }
                            }
                        })
                        .then(res => {
                            this.notes = res.data;
                        })
                        .catch()
                        .then(() => {
                            this.loading = false;
                        });
            },

            handleRemove(file, fileList) {

            },
            handlePreview(file, fileList) {

            },
            handleExceed(files, fileList) {
                this.$message.warning(`The limit is 3, you selected ${files.length} files this time, add up to ${files.length + fileList.length} totally`);
            },
            beforeRemove(file, fileList) {
                return this.$confirm(`Cancel the transfert of ${file.name} ?`);
            },
            onSuccess(file) {
                console.log(file);
            },


            handleError(err, file, fileList) {
                console.log(err);
            },
            beforeImageUpload(){
                this.note_image_loading = true;
            },
            beforeFileUpload(){
                this.note_file_loading = true;
            },
            uploadImageSuccess(res, file, fileList) {
                this.images.push({
                    url: "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name,
                    name: res.result.files.file[0].originalFilename
                });
                this.note_image_loading = false;
            },

            uploadFileSuccess(res, file, fileList) {
                this.files.push({
                    url: "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name,
                    name: res.result.files.file[0].originalFilename
                });
                this.note_file_loading = false;
            }
        }
    };
</script>

<style lang="scss">
  .booking-account-notes {
    .profile-avatar-stack {
      border-radius: 50%;
      border: 1px solid white;
    }

    .profile-avatar-stack:not(:first-child) {
      margin-left: -10px;
    }

    .el-card {
      margin: 0 auto 20px auto;

      .wd-tab-notes-author {
        p {
          margin: 0;
        }
      }

      .wd-tab-notes-pd {
        p {
          margin: 0;
          line-height: 1.3;
          font-size: 1.2rem;

          &:first-child {
            color: black;
          }
        }
      }

      .wd-tab-notes-dt {
        p {
          margin: 0;
          line-height: 1.3;
          font-size: 1.2rem;
        }
      }

      .wd-tab-notes-content {
        p {
          margin: 10px 0;
          line-height: 1.5;
          font-size: 1.2rem;
        }
      }

      .wd-tab-notes-additional {
        span {
          color: $launch-primary-color;
        }
      }
    }

    .upload-btn {
      //width:auto;
      display: inline-block;

      button {
        i {
          font-size: 18px;
          padding: 5px;
        }
      }
    }

    .add-member,
    .add-to-booking {
      font-size: 18px;
      padding: 5px;
    }

    .el-card {
      box-shadow: none;
    }

    .add-to-booking {
      line-height: 40px;
    }

    .note-meta {
      .note-image, .note-files {
        i {
          font-size: 18px;
          color: $launch-primary-color;
        }

      }


    }
  }
</style>
