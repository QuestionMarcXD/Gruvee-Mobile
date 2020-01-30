import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'
import { Navigation } from 'react-native-navigation'

// Redux
import { connect } from 'react-redux'
import {
    ADD_SONG_TO_PLAYLIST,
    FETCH_SONGS,
} from 'Gruvee/Redux/Actions/ActionsType'

import spotifyMockFindResponse from 'Gruvee/Mock/spotifyMockFindResponse'
import AddItemButton from 'Gruvee/Components/Common/AddItemButton'
import SwipeableSongItem from './components/SwipeableSongItem/SwipeableSongItem'
import * as StyleConstants from '@StyleConstants'
import * as NavigationConstants from '@NavigationConstants'
import Song from '../../lib/Song'

const SongListView = ({
    playlistId,
    songs,
    fetchSongs,
    addSongToPlaylist,
    deleteSongFromPlaylistAction,
    updateSongsInPlaylistAction,
}) => {
    const [songsToDisplay, setSongsToDisplay] = useState([])

    useEffect(() => {
        fetchSongs(playlistId)
    }, [])

    // Actions
    const addSongAction = (songLink, comment) => {
        // TODO: Call service API to get song info from link

        // Create song object
        const newSong = new Song(spotifyMockFindResponse, songLink, comment)

        // Right not we are just going to mock it up until auth is setup
        addSongToPlaylist(playlistId, newSong)

        // Set songs to display
        fetchSongs(playlistId)

        // Dismiss song modal overlay
        Navigation.dismissOverlay(NavigationConstants.ADD_SONG_MODAL_NAV_ID)
    }

    const deleteItemById = id => {
        // TODO: Add some sort of promise
        // If the first filter fails, lets not do the next one

        // Filter out from current state
        setSongsToDisplay(songsToDisplay.filter(song => song.id !== id))

        // Filter out song from parent state
        deleteSongFromPlaylistAction(playlistId, id)
    }

    const addCommentFromSongAction = (songId, comments) => {
        const updatedSongs = songsToDisplay.map(song => {
            if (song.id === songId) {
                song.comments = comments
            }

            return song
        })

        // Update songState
        setSongsToDisplay(updatedSongs)

        // Update playlistState
        updateSongsInPlaylistAction(playlistId, updatedSongs)
    }

    const deleteCommentFromSongAction = (songId, commentId) => {
        const updatedSongs = songsToDisplay.map(song => {
            if (song.id === songId) {
                song.comments = song.comments.filter(
                    comment => comment.id !== commentId
                )
            }

            return song
        })

        // Update songState
        setSongsToDisplay(updatedSongs)

        // Update playlistState
        updateSongsInPlaylistAction(playlistId, updatedSongs)
    }

    const navigateToAddSongModalAction = () => {
        // Navigate to add playlist modal
        Navigation.showOverlay({
            component: {
                id: NavigationConstants.ADD_SONG_MODAL_NAV_ID,
                name: NavigationConstants.ADD_SONG_MODAL_NAV_NAME,
                options: {
                    overlay: {
                        interceptTouchOutside: false,
                    },
                },
                passProps: {
                    title: 'Add Song',
                    addSongAction,
                },
            },
        })
    }

    const renderItem = ({ item }) => (
        <SwipeableSongItem
            song={item}
            deleteItemById={() => deleteItemById(item.id)}
            addCommentFromSongAction={addCommentFromSongAction}
            deleteCommentFromSongAction={deleteCommentFromSongAction}
            updateSongsInPlaylistAction={updateSongsInPlaylistAction}
        />
    )

    return (
        <>
            <SwipeListView
                style={styles.Container}
                contentContainerStyle={styles.ContentContainer}
                showsVerticalScrollIndicator
                data={songs}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
            />
            {/* MADPROPZ poopuhchoo */}
            <View style={styles.ButtonContainer}>
                <AddItemButton
                    style={styles.Button}
                    addItemAction={navigateToAddSongModalAction}
                />
            </View>
        </>
    )
}

const keyExtractor = item => `${item.id}`

// Styles
const styles = StyleSheet.create({
    Container: {
        backgroundColor: StyleConstants.BASE_BACKGROUND_COLOR,
    },
    ContentContainer: {
        padding: StyleConstants.TABLE_CONTAINER_CONTENT_SPACING,
        paddingBottom: StyleConstants.TABLE_CONTAINER_BOTTOM_PADDING,
    },
    ButtonContainer: {
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: 50,
    },
    Button: {
        width: StyleConstants.ADD_BUTTON_SIZE,
        height: StyleConstants.ADD_BUTTON_SIZE,
    },
})

// Redux Action Creators
const addSongToPlaylist = (playlistId, song) => {
    return {
        type: ADD_SONG_TO_PLAYLIST,
        data: { playlistId, song },
    }
}
const fetchSongs = playlistId => {
    return {
        type: FETCH_SONGS,
        data: playlistId,
    }
}

// Redux Mappers
const mapStateToProps = state => {
    return { songs: state.PlaylistDataReducer.songs }
}
const mapDispatchToProps = dispatch => ({
    addSongToPlaylist: (playlistId, song) =>
        dispatch(addSongToPlaylist(playlistId, song)),
    fetchSongs: playlistId => dispatch(fetchSongs(playlistId)),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SongListView)
